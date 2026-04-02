import { describe, it, expect, vi } from 'vitest'
import { errorHandler, createError } from '../../middleware/errorHandler.js'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('createError', () => {
  it('crea un error con status y mensaje', () => {
    const err = createError(404, 'Not found')
    expect(err.message).toBe('Not found')
    expect(err.status).toBe(404)
  })

  it('adjunta details si se pasan', () => {
    const details = [{ field: 'email' }]
    const err = createError(400, 'Validation error', details)
    expect(err.details).toEqual(details)
  })
})

describe('errorHandler', () => {
  const req = { method: 'POST', path: '/api/auth/login' }
  const next = vi.fn()

  it('responde con el status del error', () => {
    const err = createError(400, 'Bad request')
    const res = mockRes()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Bad request' }))
  })

  it('devuelve 500 si el error no tiene status', () => {
    const err = new Error('algo explotó')
    const res = mockRes()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('incluye details en la respuesta si existen', () => {
    const err = createError(422, 'Validation failed', [{ field: 'email' }])
    const res = mockRes()

    errorHandler(err, req, res, next)

    const body = res.json.mock.calls[0][0]
    expect(body.details).toBeDefined()
  })
})
