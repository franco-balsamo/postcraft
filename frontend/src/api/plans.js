import client from './client'

export const getPlans = async () => {
  const { data } = await client.get('/api/plans')
  return data
}

export const upgradePlan = async ({ plan, successUrl, cancelUrl }) => {
  const { data } = await client.post('/api/plans/upgrade', { plan, successUrl, cancelUrl })
  return data
}

export const getCurrentPlan = async () => {
  const { data } = await client.get('/api/plans/current')
  return data
}

// Opens the Stripe Customer Portal, where the user can cancel/downgrade
// their subscription. There is no direct "downgrade to free" endpoint:
// the plan only actually changes to free once Stripe confirms the
// cancellation via webhook (see backend routes/webhooks.js).
export const openBillingPortal = async ({ returnUrl } = {}) => {
  const { data } = await client.post('/api/plans/portal', { returnUrl })
  return data
}
