import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (req, res, next) => next(),
}));
vi.mock('../../config/db.js', () => ({ query: vi.fn() }));
vi.mock('../../services/planService.js', () => ({
  reservePostSlot: vi.fn(),
  releasePostSlot: vi.fn(),
}));
vi.mock('../../services/publishService.js', () => ({
  uploadImage: vi.fn(),
  publishToNetworks: vi.fn(),
  updatePostStatus: vi.fn(),
}));
vi.mock('../../services/tokenService.js', () => ({
  refreshTokenIfNeeded: vi.fn(),
}));
vi.mock('../../services/scheduleService.js', () => ({
  schedulePost: vi.fn(),
}));

const { query } = await import('../../config/db.js');
const { reservePostSlot, releasePostSlot } = await import('../../services/planService.js');
const { uploadImage, publishToNetworks, updatePostStatus } =
  await import('../../services/publishService.js');
const { refreshTokenIfNeeded } = await import('../../services/tokenService.js');
const { schedulePost } = await import('../../services/scheduleService.js');
const { default: publishRouter } = await import('../../routes/publish.js');
const { errorHandler } = await import('../../middleware/errorHandler.js');

const app = express();
app.use(express.json());
app.use('/api/publish', publishRouter);
app.use(errorHandler);

function authHeader() {
  const token = jwt.sign({ email: 'user@test.com', plan: 'free' }, 'test-secret', {
    subject: 'user-123',
    expiresIn: '1h',
  });
  return `Bearer ${token}`;
}

const validBody = {
  imageBase64: 'data:image/png;base64,AAAA',
  caption: 'hello',
  networks: ['instagram'],
};

beforeEach(() => {
  vi.clearAllMocks();
  reservePostSlot.mockResolvedValue(undefined);
  releasePostSlot.mockResolvedValue(undefined);
});

describe('POST /api/publish — validation', () => {
  it('rechaza sin token de autenticación', async () => {
    const res = await request(app).post('/api/publish').send(validBody);
    expect(res.status).toBe(401);
  });

  it('rechaza sin imageBase64', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, imageBase64: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/imageBase64/);
  });

  it('rechaza caption mayor a 2200 caracteres', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, caption: 'a'.repeat(2201) });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/caption/);
  });

  it('rechaza networks vacío', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, networks: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/networks/);
  });

  it('rechaza networks con valores inválidos, listándolos', async () => {
    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, networks: ['tiktok'] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tiktok/);
  });

  it('no reserva el slot del plan si la validación falla', async () => {
    await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, networks: [] });

    expect(reservePostSlot).not.toHaveBeenCalled();
  });
});

describe('POST /api/publish — publicación inmediata', () => {
  it('publica y no libera el slot si todas las redes tienen éxito', async () => {
    uploadImage.mockResolvedValue({ url: 'https://img', cloudinaryId: 'abc' });
    query
      .mockResolvedValueOnce({ rows: [{ id: 'post-1' }] }) // INSERT
      .mockResolvedValueOnce({ rows: [{ id: 'post-1', status: 'published' }] }); // SELECT final
    refreshTokenIfNeeded.mockResolvedValue({ page_access_token: 'tok' });
    publishToNetworks.mockResolvedValue({ fb_post_id: null, ig_media_id: 'ig-1', errors: [] });

    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send(validBody);

    expect(res.status).toBe(201);
    expect(reservePostSlot).toHaveBeenCalledWith('user-123');
    expect(releasePostSlot).not.toHaveBeenCalled();
    expect(updatePostStatus).toHaveBeenCalledWith(
      'post-1',
      expect.objectContaining({
        status: 'published',
      })
    );
  });

  it('libera el slot si la publicación falla en todas las redes', async () => {
    uploadImage.mockResolvedValue({ url: 'https://img', cloudinaryId: 'abc' });
    query
      .mockResolvedValueOnce({ rows: [{ id: 'post-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'post-1', status: 'failed' }] });
    refreshTokenIfNeeded.mockResolvedValue({ page_access_token: 'tok' });
    publishToNetworks.mockResolvedValue({
      errors: [{ network: 'instagram', error: 'boom' }],
    });

    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send(validBody);

    expect(res.status).toBe(502);
    expect(reservePostSlot).toHaveBeenCalledWith('user-123');
    expect(releasePostSlot).toHaveBeenCalledWith('user-123');
  });

  it('libera el slot si no hay cuenta de Meta conectada', async () => {
    uploadImage.mockResolvedValue({ url: 'https://img', cloudinaryId: 'abc' });
    query.mockResolvedValueOnce({ rows: [{ id: 'post-1' }] });
    refreshTokenIfNeeded.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send(validBody);

    expect(res.status).toBe(400);
    expect(releasePostSlot).toHaveBeenCalledWith('user-123');
  });

  it('devuelve 402 y no publica si no hay slots en el plan', async () => {
    reservePostSlot.mockRejectedValueOnce(
      Object.assign(new Error('limit reached'), { status: 402 })
    );

    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send(validBody);

    expect(res.status).toBe(402);
    expect(uploadImage).not.toHaveBeenCalled();
    expect(releasePostSlot).not.toHaveBeenCalled(); // never reserved, nothing to refund
  });
});

describe('POST /api/publish — programado', () => {
  it('encola el post y mantiene el slot reservado', async () => {
    uploadImage.mockResolvedValue({ url: 'https://img', cloudinaryId: 'abc' });
    query
      .mockResolvedValueOnce({ rows: [{ id: 'post-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'post-1', status: 'queued' }] });
    schedulePost.mockResolvedValue({ id: 'job-1' });

    const res = await request(app)
      .post('/api/publish')
      .set('Authorization', authHeader())
      .send({ ...validBody, scheduledAt: '2099-01-01T00:00:00.000Z' });

    expect(res.status).toBe(202);
    expect(schedulePost).toHaveBeenCalledWith('post-1', '2099-01-01T00:00:00.000Z');
    expect(releasePostSlot).not.toHaveBeenCalled();
    expect(refreshTokenIfNeeded).not.toHaveBeenCalled();
  });
});
