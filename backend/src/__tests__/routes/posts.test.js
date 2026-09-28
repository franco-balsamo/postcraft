import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (req, res, next) => next(),
}));
vi.mock('../../config/db.js', () => ({ query: vi.fn() }));
vi.mock('../../services/publishService.js', () => ({ deleteImage: vi.fn() }));
vi.mock('../../services/scheduleService.js', () => ({ cancelScheduledPost: vi.fn() }));

const { query } = await import('../../config/db.js');
const { deleteImage } = await import('../../services/publishService.js');
const { default: postsRouter } = await import('../../routes/posts.js');
const { errorHandler } = await import('../../middleware/errorHandler.js');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);
app.use(errorHandler);

function authHeader() {
  const token = jwt.sign({ email: 'user@test.com', plan: 'free' }, 'test-secret', {
    subject: 'user-123',
    expiresIn: '1h',
  });
  return `Bearer ${token}`;
}

const VALID_ID = '11111111-1111-4111-8111-111111111111';

beforeEach(() => vi.clearAllMocks());

describe('GET /api/posts', () => {
  it('rechaza sin token de autenticación', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(401);
  });

  it('usa page=1 y limit=20 por default', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const res = await request(app).get('/api/posts').set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 });
  });

  it('acepta un filtro de status válido', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'p1', status: 'published' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app)
      .get('/api/posts?status=published')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(query.mock.calls[0][0]).toMatch(/AND status = \$2/);
  });

  it('rechaza un status fuera del enum', async () => {
    const res = await request(app)
      .get('/api/posts?status=archivado')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/);
  });

  it('rechaza page menor a 1', async () => {
    const res = await request(app).get('/api/posts?page=0').set('Authorization', authHeader());

    expect(res.status).toBe(400);
  });

  it('cappea limit a 100 vía el schema', async () => {
    const res = await request(app).get('/api/posts?limit=500').set('Authorization', authHeader());

    expect(res.status).toBe(400);
  });
});

describe('GET /api/posts/:id', () => {
  it('rechaza un id que no es UUID', async () => {
    const res = await request(app)
      .get('/api/posts/no-es-un-uuid')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid post id/);
  });

  it('devuelve 404 si el post no existe (o no es del usuario)', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get(`/api/posts/${VALID_ID}`).set('Authorization', authHeader());

    expect(res.status).toBe(404);
  });

  it('devuelve el post si existe', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: VALID_ID, status: 'draft' }] });

    const res = await request(app).get(`/api/posts/${VALID_ID}`).set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.post.id).toBe(VALID_ID);
  });
});

describe('DELETE /api/posts/:id', () => {
  it('rechaza un id que no es UUID', async () => {
    const res = await request(app)
      .delete('/api/posts/no-es-un-uuid')
      .set('Authorization', authHeader());

    expect(res.status).toBe(400);
  });

  it('rechaza borrar un post ya publicado', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: VALID_ID, status: 'published' }] });

    const res = await request(app)
      .delete(`/api/posts/${VALID_ID}`)
      .set('Authorization', authHeader());

    expect(res.status).toBe(409);
  });

  it('borra un borrador y su imagen de Cloudinary', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: VALID_ID, status: 'draft', cloudinary_id: 'cloud-1' }],
      })
      .mockResolvedValueOnce({ rows: [] });
    deleteImage.mockResolvedValue();

    const res = await request(app)
      .delete(`/api/posts/${VALID_ID}`)
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith('cloud-1');
  });
});
