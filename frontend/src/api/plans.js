import client from './client'

export const getPlans = async () => {
  const { data } = await client.get('/api/plans')
  return data
}

export const upgradePlan = async ({ planId, paymentMethodId }) => {
  const { data } = await client.post('/api/plans/upgrade', { planId, paymentMethodId })
  return data
}

export const getCurrentPlan = async () => {
  const { data } = await client.get('/api/plans/current')
  return data
}

export const cancelPlan = async () => {
  const { data } = await client.post('/api/plans/cancel')
  return data
}
