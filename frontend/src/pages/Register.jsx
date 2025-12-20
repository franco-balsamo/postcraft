import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { register } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth, token } = useAuthStore()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  if (token) {
    navigate('/editor', { replace: true })
    return null
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (!form.email) errs.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Debe tener al menos una mayúscula'
    else if (!/[a-z]/.test(form.password)) errs.password = 'Debe tener al menos una minúscula'
    else if (!/[0-9]/.test(form.password)) errs.password = 'Debe tener al menos un número'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    return errs
  }

  const mutation = useMutation({
    mutationFn: register,
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
      const { confirmPassword, ...payload } = form
      mutation.mutate(payload)
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
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-brand-cyan mb-4">
              <span className="text-brand-dark font-black text-2xl">PC</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
            <p className="text-slate-500 text-sm mt-1">Empieza gratis, sin tarjeta de crédito</p>
          </div>

          {/* Plan highlight */}
          <div className="mb-6 p-3 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center gap-3">
            <div className="text-brand-green text-lg">✓</div>
            <div>
              <p className="text-sm font-medium text-brand-green">Plan Free incluido</p>
              <p className="text-xs text-slate-500">10 posts/mes · 1 cuenta · Templates básicos</p>
            </div>
          </div>

          {mutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {mutation.error?.response?.data?.error ||
                mutation.error?.response?.data?.message ||
                'Error al crear la cuenta. Por favor intentá de nuevo.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              error={errors.name}
              placeholder="Tu nombre"
              autoComplete="name"
            />

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
              placeholder="Mín. 8 caracteres, mayúscula y número."
              autoComplete="new-password"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={mutation.isPending}
              className="mt-2"
            >
              Crear cuenta gratis
            </Button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-4">
            Al registrarte aceptás nuestros{' '}
            <span className="text-slate-400 cursor-pointer hover:text-white">Términos de servicio</span>
          </p>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              ¿Ya tenés cuenta?{' '}
              <Link
                to="/login"
                className="text-brand-green hover:text-brand-cyan transition-colors font-medium"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
