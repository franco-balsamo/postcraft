import client from './client'

export const getPosts = async ({ page = 1, status = 'all' } = {}) => {
  const params = { page, limit: 10 }
  if (status !== 'all') params.status = status
  const { data } = await client.get('/api/posts', { params })
  return data
}

export const createPost = async (payload) => {
  const { data } = await client.post('/api/posts', payload)
  return data
}

export const deletePost = async (id) => {
  const { data } = await client.delete(`/api/posts/${id}`)
  return data
}

export const publishPost = async (payload) => {
  const { data } = await client.post('/api/posts/publish', payload)
  return data
}

export const schedulePost = async (payload) => {
  const { data } = await client.post('/api/posts/schedule', payload)
  return data
}

export const getDashboardStats = async () => {
  const { data } = await client.get('/api/posts/stats')
  return data
}
