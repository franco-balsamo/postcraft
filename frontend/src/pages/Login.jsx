import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth, token } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  // Redirect if already logged in
  if (token) {
    navigate('/editor', { replace: true })
    return null
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    return errs
  }

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      navigate('/editor')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      mutation.mutate(form)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-brand-cyan mb-4">
              <span className="text-brand-dark font-black text-2xl">PC</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Bienvenido de nuevo</h1>
            <p className="text-slate-500 text-sm mt-1">Ingresa a tu cuenta de PostCraft</p>
          </div>

          {/* Error from API */}
          {mutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {mutation.error?.response?.data?.error ||
                mutation.error?.response?.data?.message ||
                'Credenciales incorrectas. Por favor verificá tus datos.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="tu@email.com"
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={mutation.isPending}
              className="mt-2"
            >
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              ¿No tenés cuenta?{' '}
              <Link
                to="/register"
                className="text-brand-green hover:text-brand-cyan transition-colors font-medium"
              >
                Crear cuenta gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          PostCraft © 2024 · Hecho para creadores de contenido
        </p>
      </div>
    </div>
  )
}
