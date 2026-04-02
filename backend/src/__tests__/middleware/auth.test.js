import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { requireAuth, optionalAuth } from '../../middleware/auth.js'

process.env.JWT_SECRET = 'test-secret'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

function signToken(payload = {}) {
  return jwt.sign(
    { email: 'test@test.com', plan: 'free', ...payload },
    'test-secret',
    { subject: 'user-123', expiresIn: '1h' }
  )
}

describe('requireAuth', () => {
  it('permite request con Bearer token válido', () => {
    const token = signToken()
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user.id).toBe('user-123')
    expect(req.user.email).toBe('test@test.com')
  })

  it('permite request con cookie válida', () => {
    const token = signToken()
    const req = { headers: {}, cookies: { postcraft_token: token } }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user.id).toBe('user-123')
  })

  it('rechaza request sin token', () => {
    const req = { headers: {}, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rechaza token con firma inválida', () => {
    const token = jwt.sign({ email: 'x@x.com' }, 'wrong-secret', { subject: 'abc' })
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
  })

  it('rechaza token expirado', () => {
    const token = jwt.sign({ email: 'x@x.com', plan: 'free' }, 'test-secret', {
      subject: 'abc',
      expiresIn: -1,
    })
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' })
  })
})

describe('optionalAuth', () => {
  it('adjunta user si el token es válido', () => {
    const token = signToken()
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user).toBeDefined()
  })

  it('continúa sin user si no hay token', () => {
    const req = { headers: {}, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user).toBeUndefined()
  })

  it('continúa sin user si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer token-roto' }, cookies: {} }
    const res = mockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user).toBeUndefined()
  })
})
