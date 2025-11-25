import client from './client'

export const login = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login', { email, password })
  return data
}

export const register = async ({ email, password, name }) => {
  const { data } = await client.post('/api/auth/register', { email, password, name })
  return data
}

export const connectMeta = async () => {
  const { data } = await client.get('/api/auth/meta/url')
  return data
}

export const getProfile = async () => {
  const { data } = await client.get('/api/auth/me')
  return data
}

export const updateProfile = async (payload) => {
  const { data } = await client.put('/api/auth/me', payload)
  return data
}
