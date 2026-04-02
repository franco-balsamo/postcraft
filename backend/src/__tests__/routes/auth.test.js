import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'

vi.mock('../../config/db.js', () => ({ query: vi.fn(), default: {} }))
vi.mock('../../config/redis.js', () => ({
  default: { on: vi.fn(), get: vi.fn(), set: vi.fn(), del: vi.fn() },
}))
vi.mock('../../services/tokenService.js', () => ({
  saveTokens: vi.fn(),
  exchangeForLongLivedToken: vi.fn(),
  fetchPagesAndIgAccounts: vi.fn(),
}))

import { query } from '../../config/db.js'
import authRouter from '../../routes/auth.js'
import { errorHandler } from '../../middleware/errorHandler.js'

process.env.JWT_SECRET = 'test-secret'
process.env.JWT_EXPIRES_IN = '7d'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use(errorHandler)

beforeEach(() => vi.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('registra un usuario nuevo y devuelve token', async () => {
    query
      .mockResolvedValueOnce({ rows: [] }) // check email duplicado
      .mockResolvedValueOnce({             // INSERT usuario
        rows: [{ id: 'uuid-1', email: 'nuevo@test.com', full_name: 'Test', plan: 'free' }],
      })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nuevo@test.com', password: 'Password1', full_name: 'Test' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('nuevo@test.com')
  })

  it('rechaza si falta el email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'Password1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/email/)
  })

  it('rechaza contraseña sin mayúscula', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com', password: 'password1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/mayúscula|uppercase/i)
  })

  it('rechaza contraseña sin número', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com', password: 'Password' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/número|number/i)
  })

  it('rechaza contraseña menor a 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com', password: 'Ab1' })

    expect(res.status).toBe(400)
  })

  it('rechaza email ya registrado', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'existente' }] })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existente@test.com', password: 'Password1' })

    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  it('devuelve token con credenciales correctas', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('Password1', 10)

    query.mockResolvedValueOnce({
      rows: [{ id: 'uuid-1', email: 'user@test.com', full_name: 'User', plan: 'free', password_hash: hash }],
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password1' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('rechaza credenciales incorrectas', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('Password1', 10)

    query.mockResolvedValueOnce({
      rows: [{ id: 'uuid-1', email: 'user@test.com', password_hash: hash, plan: 'free' }],
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPass1' })

    expect(res.status).toBe(401)
  })

  it('rechaza si el usuario no existe', async () => {
    query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'Password1' })

    expect(res.status).toBe(401)
  })

  it('rechaza si faltan campos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@x.com' })

    expect(res.status).toBe(400)
  })
})
