import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock db antes de importar el servicio
vi.mock('../../config/db.js', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}));

import { query } from '../../config/db.js';
import { reservePostSlot, releasePostSlot, getPlanLimit } from '../../services/planService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPlanLimit', () => {
  it('devuelve el límite de la DB si existe', async () => {
    query.mockResolvedValueOnce({ rows: [{ monthly_posts: 50 }] });

    const limit = await getPlanLimit('starter');
    expect(limit).toBe(50);
  });

  it('devuelve el fallback si la DB falla', async () => {
    query.mockRejectedValueOnce(new Error('DB down'));

    const limit = await getPlanLimit('free');
    expect(limit).toBe(5);
  });

  it('devuelve el fallback de agency (no ilimitado) si la DB falla', async () => {
    query.mockRejectedValueOnce(new Error('DB down'));

    const limit = await getPlanLimit('agency');
    expect(limit).toBe(1000);
  });
});

describe('reservePostSlot', () => {
  it('reserva un slot si el usuario está dentro del límite', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ plan: 'free' }] }) // plan del usuario
      .mockResolvedValueOnce({ rows: [{ monthly_posts: 10 }] }) // límite del plan
      .mockResolvedValueOnce({ rows: [{ posts_this_month: 4 }] }); // UPDATE atómico OK

    await expect(reservePostSlot('user-123')).resolves.not.toThrow();
  });

  it('lanza 402 si el usuario llegó al límite (el UPDATE atómico no matchea ninguna fila)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ plan: 'free' }] })
      .mockResolvedValueOnce({ rows: [{ monthly_posts: 10 }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(reservePostSlot('user-123')).rejects.toMatchObject({ status: 402 });
  });

  it('lanza 404 si el usuario no existe', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await expect(reservePostSlot('no-existe')).rejects.toMatchObject({ status: 404 });
  });
});

describe('releasePostSlot', () => {
  it('decrementa el contador de posts del usuario sin bajar de 0', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await releasePostSlot('user-123');

    expect(query).toHaveBeenCalledWith(expect.stringContaining('GREATEST'), ['user-123']);
  });
});
