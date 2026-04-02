import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock db antes de importar el servicio
vi.mock('../../config/db.js', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}))

import { query } from '../../config/db.js'
import { checkPlanLimit, getPlanLimit } from '../../services/planService.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPlanLimit', () => {
  it('devuelve el límite de la DB si existe', async () => {
    query.mockResolvedValueOnce({ rows: [{ monthly_posts: 50 }] })

    const limit = await getPlanLimit('starter')
    expect(limit).toBe(50)
  })

  it('devuelve el fallback si la DB falla', async () => {
    query.mockRejectedValueOnce(new Error('DB down'))

    const limit = await getPlanLimit('free')
    expect(limit).toBe(10)
  })

  it('devuelve null para plan agency (ilimitado)', async () => {
    query.mockRejectedValueOnce(new Error('DB down'))

    const limit = await getPlanLimit('agency')
    expect(limit).toBeNull()
  })
})

describe('checkPlanLimit', () => {
  it('pasa sin error si el usuario está dentro del límite', async () => {
    // usuario con plan free, 3 posts usados
    query
      .mockResolvedValueOnce({
        rows: [{
          plan: 'free',
          posts_this_month: 3,
          billing_cycle_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        }],
      })
      // límite del plan
      .mockResolvedValueOnce({ rows: [{ monthly_posts: 10 }] })

    await expect(checkPlanLimit('user-123')).resolves.not.toThrow()
  })

  it('lanza 402 si el usuario llegó al límite', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{
          plan: 'free',
          posts_this_month: 10,
          billing_cycle_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        }],
      })
      .mockResolvedValueOnce({ rows: [{ monthly_posts: 10 }] })

    await expect(checkPlanLimit('user-123')).rejects.toMatchObject({ status: 402 })
  })

  it('lanza 404 si el usuario no existe', async () => {
    query.mockResolvedValueOnce({ rows: [] })

    await expect(checkPlanLimit('no-existe')).rejects.toMatchObject({ status: 404 })
  })
})
