import { query, withTransaction } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import 'dotenv/config';

// Fallback limits in case DB is unreachable.
// null means unlimited (Agency plan).
const FALLBACK_LIMITS = {
  free:   parseInt(process.env.PLAN_FREE_LIMIT,   10) || 10,
  pro:    parseInt(process.env.PLAN_PRO_LIMIT,    10) || 100,
  agency: null, // unlimited
};

/**
 * Returns the monthly post limit for a given plan name.
 */
export async function getPlanLimit(plan) {
  try {
    const { rows } = await query(
      'SELECT monthly_posts FROM plan_limits WHERE plan = $1',
      [plan]
    );
    if (rows[0]) return rows[0].monthly_posts;
  } catch {
    // fall through to fallback
  }
  // use `in` check so null (unlimited) is preserved and not replaced with free limit
  return plan in FALLBACK_LIMITS ? FALLBACK_LIMITS[plan] : FALLBACK_LIMITS.free;
}

/**
 * Returns all available plans with their details.
 */
export async function getAllPlans() {
  const { rows } = await query(
    'SELECT * FROM plan_limits ORDER BY price_monthly ASC'
  );
  return rows;
}

/**
 * Check whether a user is allowed to publish another post this month.
 * Throws 402 if they have reached their limit.
 */
export async function checkPlanLimit(userId) {
  const { rows } = await query(
    'SELECT plan, posts_this_month, billing_cycle_start FROM users WHERE id = $1',
    [userId]
  );

  if (!rows[0]) {
    throw createError(404, 'User not found');
  }

  const { plan, posts_this_month, billing_cycle_start } = rows[0];

  // Auto-reset if we are in a new billing month
  const cycleStart = new Date(billing_cycle_start);
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (cycleStart < startOfCurrentMonth) {
    await query(
      'UPDATE users SET posts_this_month = 0, billing_cycle_start = $1 WHERE id = $2',
      [startOfCurrentMonth, userId]
    );
    return; // reset happened, count is now 0
  }

  const limit = await getPlanLimit(plan);

  // null limit means unlimited (Agency plan)
  if (limit !== null && posts_this_month >= limit) {
    throw createError(
      402,
      `Monthly post limit reached (${posts_this_month}/${limit}) for plan "${plan}". Please upgrade to continue publishing.`
    );
  }
}

/**
 * Atomically increment the post counter for a user.
 * Should be called after a successful publish.
 */
export async function incrementPostCount(userId) {
  await query(
    'UPDATE users SET posts_this_month = posts_this_month + 1 WHERE id = $1',
    [userId]
  );
}

/**
 * Reset monthly counters for ALL users (intended for a monthly cron job).
 * Resets posts_this_month to 0 and sets billing_cycle_start to now.
 */
export async function resetMonthlyCounts() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { rowCount } = await query(
    `UPDATE users
     SET posts_this_month = 0,
         billing_cycle_start = $1
     WHERE billing_cycle_start < $1`,
    [startOfMonth]
  );

  console.log(`[planService] resetMonthlyCounts – reset ${rowCount} user(s)`);
  return rowCount;
}

/**
 * Update a user's plan (called after Stripe payment confirmation).
 */
export async function setUserPlan(userId, newPlan) {
  const validPlans = ['free', 'pro', 'agency'];
  if (!validPlans.includes(newPlan)) {
    throw createError(400, `Invalid plan: ${newPlan}`);
  }

  const { rows } = await query(
    'UPDATE users SET plan = $1 WHERE id = $2 RETURNING id, plan',
    [newPlan, userId]
  );

  if (!rows[0]) {
    throw createError(404, 'User not found');
  }

  return rows[0];
}

/**
 * Save Stripe customer/subscription IDs to the user record.
 */
export async function saveStripeIds(userId, { customerId, subscriptionId }) {
  await query(
    `UPDATE users
     SET stripe_customer_id      = COALESCE($1, stripe_customer_id),
         stripe_subscription_id  = COALESCE($2, stripe_subscription_id)
     WHERE id = $3`,
    [customerId || null, subscriptionId || null, userId]
  );
}

/**
 * Find a user by Stripe customer ID.
 */
export async function getUserByStripeCustomer(stripeCustomerId) {
  const { rows } = await query(
    'SELECT * FROM users WHERE stripe_customer_id = $1 LIMIT 1',
    [stripeCustomerId]
  );
  return rows[0] || null;
}

/**
 * Set or clear the payment_failed flag on a user record.
 * Called on invoice.payment_failed (true) and invoice.paid (false).
 */
export async function markPaymentFailed(userId, failed) {
  await query(
    'UPDATE users SET payment_failed = $1 WHERE id = $2',
    [Boolean(failed), userId]
  );
}
