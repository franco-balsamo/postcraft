import { Router } from 'express';
import Stripe from 'stripe';
import { setUserPlan, saveStripeIds, getUserByStripeCustomer, markPaymentFailed } from '../services/planService.js';
import 'dotenv/config';

export const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Stripe requires the raw body to validate the signature.
// This route must be registered BEFORE express.json() is applied globally,
// OR it must use express.raw(). We handle this in app.js by registering
// the /webhooks/stripe route with express.raw().

/**
 * POST /webhooks/stripe
 * Handles Stripe webhook events.
 */
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,           // must be raw Buffer (express.raw())
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Stripe signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
  }

  console.log(`[webhook] Stripe event: ${event.type}`);

  try {
    switch (event.type) {

      // ── Payment succeeded → upgrade plan ─────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const userId  = session.metadata?.userId;
        const newPlan = session.metadata?.newPlan;

        if (!userId || !newPlan) {
          console.warn('[webhook] checkout.session.completed missing metadata');
          break;
        }

        await setUserPlan(userId, newPlan);
        await saveStripeIds(userId, {
          customerId:     session.customer,
          subscriptionId: session.subscription,
        });

        console.log(`[webhook] User ${userId} upgraded to ${newPlan}`);
        break;
      }

      // ── Subscription activated (covers first invoice) ─────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub    = event.data.object;
        const status = sub.status; // active, trialing, past_due, canceled, etc.

        if (status !== 'active' && status !== 'trialing') break;

        const newPlan = sub.metadata?.newPlan;
        const userId  = sub.metadata?.userId;

        if (!userId || !newPlan) break;

        await setUserPlan(userId, newPlan);
        await saveStripeIds(userId, {
          customerId:     sub.customer,
          subscriptionId: sub.id,
        });
        break;
      }

      // ── Subscription cancelled / payment failed → downgrade to free ───────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object;
        const userId = sub.metadata?.userId;

        if (userId) {
          await setUserPlan(userId, 'free');
          console.log(`[webhook] User ${userId} downgraded to free (subscription cancelled)`);
        } else {
          // Try to find user by customer ID
          const user = await getUserByStripeCustomer(sub.customer);
          if (user) {
            await setUserPlan(user.id, 'free');
            console.log(`[webhook] User ${user.id} downgraded to free (via customer lookup)`);
          }
        }
        break;
      }

      // ── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice    = event.data.object;
        const customerId = invoice.customer;

        const user = await getUserByStripeCustomer(customerId);
        if (user) {
          await markPaymentFailed(user.id, true);
          console.warn(`[webhook] Payment failed for user ${user.id} – payment_failed flag set`);
        }
        break;
      }

      // ── Invoice paid (recurring renewal) ─────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object;
        const sub     = invoice.subscription;

        if (!sub) break;

        // Ensure the plan remains active on successful renewal
        const stripeSubscription = await stripe.subscriptions.retrieve(sub);
        const userId  = stripeSubscription.metadata?.userId;
        const newPlan = stripeSubscription.metadata?.newPlan;

        if (userId && newPlan) {
          await setUserPlan(userId, newPlan);
          // Clear any payment_failed flag on successful renewal
          await markPaymentFailed(userId, false);
        }
        break;
      }

      default:
        // Unhandled event types – silently acknowledge
        break;
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err.message, err.stack);
    // Still return 200 so Stripe doesn't retry, but log the issue
  }

  res.json({ received: true });
});

export default router;
