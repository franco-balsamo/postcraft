import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import client from '../api/client'

/**
 * Handles the redirect from Meta OAuth.
 * The backend sets a JWT as an HTTP-only cookie and redirects here.
 * We call /auth/me to exchange that cookie for user info.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const error = params.get('error')
    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true })
      return
    }

    client
      .get('/auth/me', { withCredentials: true })
      .then(({ data }) => {
        // Store user info; token lives in the HTTP-only cookie
        setAuth(data.user, null)
        navigate('/editor', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <p className="text-white text-sm">Conectando cuenta…</p>
    </div>
  )
}
