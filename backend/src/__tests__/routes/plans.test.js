import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
process.env.STRIPE_PRICE_STARTER = 'price_starter_test'
process.env.STRIPE_PRICE_PRO = 'price_pro_test'
process.env.STRIPE_PRICE_AGENCY = 'price_agency_test'
process.env.FRONTEND_URL = 'http://localhost:5173'

const { stripeMock } = vi.hoisted(() => ({
  stripeMock: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
}))

vi.mock('stripe', () => ({
  default: vi.fn(function StripeMock() { return stripeMock }),
}))
vi.mock('../../config/db.js', () => ({ query: vi.fn(), default: {} }))

// PLAN_PRICE_MAP is built from process.env at module load time, so the
// router must be imported dynamically, after the env vars above are set.
const { query } = await import('../../config/db.js')
const { default: plansRouter } = await import('../../routes/plans.js')
const { errorHandler } = await import('../../middleware/errorHandler.js')

const app = express()
app.use(express.json())
app.use('/api/plans', plansRouter)
app.use(errorHandler)

function authHeader(payload = {}) {
  const token = jwt.sign(
    { email: 'user@test.com', plan: 'free', ...payload },
    'test-secret',
    { subject: 'user-123', expiresIn: '1h' }
  )
  return `Bearer ${token}`
}

beforeEach(() => vi.clearAllMocks())

describe('GET /api/plans', () => {
  it('devuelve los planes de la DB con sus límites y precio de Stripe', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          plan: 'free',
          label: 'Free',
          price_monthly: '0.00',
          currency: 'usd',
          billing_interval: null,
          monthly_posts: 5,
          networks: ['instagram', 'facebook'],
          scheduling: false,
        },
        {
          plan: 'pro',
          label: 'Pro',
          price_monthly: '49.00',
          currency: 'usd',
          billing_interval: 'month',
          monthly_posts: 200,
          networks: ['instagram', 'facebook'],
          scheduling: true,
        },
      ],
    })

    const res = await request(app).get('/api/plans')

    expect(res.status).toBe(200)
    expect(res.body.plans).toEqual([
      {
        name: 'free',
        label: 'Free',
        price: 0,
        currency: 'usd',
        interval: null,
        monthlyPosts: 5,
        networks: ['instagram', 'facebook'],
        scheduling: false,
        stripePriceId: null,
      },
      {
        name: 'pro',
        label: 'Pro',
        price: 49,
        currency: 'usd',
        interval: 'month',
        monthlyPosts: 200,
        networks: ['instagram', 'facebook'],
        scheduling: true,
        stripePriceId: 'price_pro_test',
      },
    ])
  })
})

describe('GET /api/plans/current', () => {
  it('rechaza sin token de autenticación', async () => {
    const res = await request(app).get('/api/plans/current')
    expect(res.status).toBe(401)
  })

  it('devuelve el plan y uso del usuario autenticado', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          email: 'user@test.com',
          plan: 'pro',
          posts_this_month: 12,
          billing_cycle_start: '2026-09-01T00:00:00.000Z',
          stripe_customer_id: 'cus_123',
          stripe_subscription_id: 'sub_123',
        }],
      })
      .mockResolvedValueOnce({
        rows: [{
          plan: 'pro',
          price_monthly: '49.00',
          scheduling: true,
          monthly_posts: 200,
        }],
      })

    const res = await request(app)
      .get('/api/plans/current')
      .set('Authorization', authHeader())

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      plan: 'pro',
      price: 49,
      postsThisMonth: 12,
      monthlyLimit: 200,
      scheduling: true,
      billingCycleStart: '2026-09-01T00:00:00.000Z',
      stripeCustomerId: 'cus_123',
    })
  })
})

describe('POST /api/plans/upgrade', () => {
  it('rechaza un plan que no existe en el mapa de precios de Stripe', async () => {
    const res = await request(app)
      .post('/api/plans/upgrade')
      .set('Authorization', authHeader())
      .send({ plan: 'not-a-real-plan' })

    expect(res.status).toBe(400)
  })

  it('rechaza si el usuario ya está en ese plan', async () => {
    query.mockResolvedValueOnce({
      rows: [{ email: 'user@test.com', stripe_customer_id: 'cus_123', plan: 'pro' }],
    })

    const res = await request(app)
      .post('/api/plans/upgrade')
      .set('Authorization', authHeader())
      .send({ plan: 'pro' })

    expect(res.status).toBe(409)
  })

  it('crea un cliente de Stripe si el usuario todavía no tiene uno, y devuelve la URL de checkout', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ email: 'user@test.com', stripe_customer_id: null, plan: 'free' }],
      })
      .mockResolvedValueOnce({ rows: [] }) // UPDATE stripe_customer_id

    stripeMock.customers.create.mockResolvedValueOnce({ id: 'cus_new' })
    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      id: 'sess_1',
      url: 'https://checkout.stripe.com/sess_1',
    })

    const res = await request(app)
      .post('/api/plans/upgrade')
      .set('Authorization', authHeader())
      .send({ plan: 'pro' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ sessionId: 'sess_1', url: 'https://checkout.stripe.com/sess_1' })
    expect(stripeMock.customers.create).toHaveBeenCalledOnce()
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new', mode: 'subscription' })
    )
  })

  it('reutiliza el cliente de Stripe existente sin crear uno nuevo', async () => {
    query.mockResolvedValueOnce({
      rows: [{ email: 'user@test.com', stripe_customer_id: 'cus_existing', plan: 'free' }],
    })

    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      id: 'sess_2',
      url: 'https://checkout.stripe.com/sess_2',
    })

    const res = await request(app)
      .post('/api/plans/upgrade')
      .set('Authorization', authHeader())
      .send({ plan: 'pro' })

    expect(res.status).toBe(200)
    expect(stripeMock.customers.create).not.toHaveBeenCalled()
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    )
  })
})

describe('POST /api/plans/portal', () => {
  it('rechaza si el usuario no tiene un cliente de Stripe asociado', async () => {
    query.mockResolvedValueOnce({ rows: [{ stripe_customer_id: null }] })

    const res = await request(app)
      .post('/api/plans/portal')
      .set('Authorization', authHeader())
      .send({})

    expect(res.status).toBe(400)
  })

  it('devuelve la URL del portal de facturación de Stripe', async () => {
    query.mockResolvedValueOnce({ rows: [{ stripe_customer_id: 'cus_123' }] })
    stripeMock.billingPortal.sessions.create.mockResolvedValueOnce({
      url: 'https://billing.stripe.com/session_abc',
    })

    const res = await request(app)
      .post('/api/plans/portal')
      .set('Authorization', authHeader())
      .send({})

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ url: 'https://billing.stripe.com/session_abc' })
    expect(stripeMock.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_123' })
    )
  })
})
