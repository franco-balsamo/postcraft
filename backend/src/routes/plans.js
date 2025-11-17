import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import 'dotenv/config';

export const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Map plan names to Stripe price IDs (from env).
// Only paid plans appear here – Free is the default and has no Stripe price.
const PLAN_PRICE_MAP = {
  pro:    process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

// PostCraft plan definitions (source of truth for the API response).
// These match exactly what is configured in Stripe.
const PLANS = [
  {
    name:         'free',
    label:        'Free',
    price:        0,
    currency:     'usd',
    interval:     null,
    monthlyPosts: 10,
    networks:     ['instagram', 'facebook'],
    scheduling:   false,
    stripePriceId: null,
  },
  {
    name:         'pro',
    label:        'Pro',
    price:        19,
    currency:     'usd',
    interval:     'month',
    monthlyPosts: 100,
    networks:     ['instagram', 'facebook'],
    scheduling:   true,
    stripePriceId: process.env.STRIPE_PRICE_PRO || null,
  },
  {
    name:         'agency',
    label:        'Agency',
    price:        49,
    currency:     'usd',
    interval:     'month',
    monthlyPosts: null,   // null = unlimited
    networks:     ['instagram', 'facebook'],
    scheduling:   true,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY || null,
  },
];

/**
 * GET /plans
 * Returns all available plans with limits and pricing.
 */
router.get('/', (_req, res) => {
  res.json({ plans: PLANS });
});

/**
 * GET /plans/current
 * Returns the authenticated user's current plan and usage.
 */
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, plan, posts_this_month, billing_cycle_start,
              stripe_customer_id, stripe_subscription_id
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!rows[0]) {
      throw createError(404, 'User not found');
    }

    const user  = rows[0];
    const planDef = PLANS.find(p => p.name === user.plan) || PLANS[0];
    const limit   = planDef.monthlyPosts; // null = unlimited

    res.json({
      plan:              user.plan,
      price:             planDef.price,
      postsThisMonth:    user.posts_this_month,
      monthlyLimit:      limit,
      scheduling:        planDef.scheduling,
      billingCycleStart: user.billing_cycle_start,
      stripeCustomerId:  user.stripe_customer_id || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /plans/upgrade
 * Body: { plan: 'starter' | 'pro' | 'agency', successUrl, cancelUrl }
 * Creates a Stripe Checkout session and returns the session URL.
 */
router.post('/upgrade', requireAuth, async (req, res, next) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;

    if (!plan || !PLAN_PRICE_MAP[plan]) {
      throw createError(
        400,
        `Invalid plan. Upgradeable plans: ${Object.keys(PLAN_PRICE_MAP).join(', ')}`
      );
    }

    const priceId = PLAN_PRICE_MAP[plan];
    if (!priceId) {
      throw createError(500, `Stripe price ID not configured for plan: ${plan}`);
    }

    // Load user to check for existing Stripe customer
    const { rows } = await query(
      'SELECT email, stripe_customer_id, plan FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = rows[0];

    if (!user) {
      throw createError(404, 'User not found');
    }

    if (user.plan === plan) {
      throw createError(409, `You are already on the ${plan} plan`);
    }

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        metadata: { userId: req.user.id },
      });
      customerId = customer.id;

      await query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, req.user.id]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL}/settings?upgrade=success`,
      cancel_url:  cancelUrl  || `${process.env.FRONTEND_URL}/settings?upgrade=cancelled`,
      metadata: {
        userId:  req.user.id,
        newPlan: plan,
      },
      subscription_data: {
        metadata: {
          userId:  req.user.id,
          newPlan: plan,
        },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /plans/portal
 * Creates a Stripe Customer Portal session so users can manage their subscription.
 */
router.post('/portal', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = rows[0];
    if (!user?.stripe_customer_id) {
      throw createError(400, 'No Stripe customer record found for this account');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   user.stripe_customer_id,
      return_url: req.body.returnUrl || `${process.env.FRONTEND_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

export default router;
