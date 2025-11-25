import axios from 'axios'

const client = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout:         30000,
  withCredentials: true, // send HTTP-only auth cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('postcraft_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('postcraft_token')
      localStorage.removeItem('postcraft_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
