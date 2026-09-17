import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'

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
    <div className="min-h-[100dvh] bg-brand-dark relative overflow-hidden flex flex-col lg:flex-row">
      {/* Ambient mesh glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-5%] w-[36rem] h-[36rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[30rem] h-[30rem] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        />
      </div>

      {/* Left: editorial message (hidden on mobile, per Editorial Split mobile collapse) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-24">
        <div className="animate-fade-up max-w-md">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-brand-green bg-brand-green/10 border border-brand-green/20 mb-8">
            Contenido para redes, sin fricción
          </span>
          <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter leading-none text-white">
            Diseñá.
            <br />
            Programá.
            <br />
            <span className="text-brand-green">Publicá.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mt-6 max-w-sm">
            Tus posts de Instagram y Facebook, listos en minutos, no en horas.
          </p>
        </div>
      </div>

      {/* Right: auth card */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-16 relative z-10">
        <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '120ms' }}>
          {/* Mobile-only compact brand mark */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-green mb-3">
              <span className="text-brand-dark font-black text-xl">PC</span>
            </div>
          </div>

          {/* Double-bezel card */}
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-2">
            <div className="rounded-[1.5rem] bg-brand-navy/80 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
                <p className="text-slate-500 text-sm mt-1">Ingresá a tu cuenta de PostCraft</p>
              </div>

              {mutation.isError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {mutation.error?.response?.data?.error ||
                    mutation.error?.response?.data?.message ||
                    'Credenciales incorrectas. Por favor verificá tus datos.'}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <GlassField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />

                <GlassField
                  label="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <PillButton type="submit" loading={mutation.isPending}>
                  Iniciar sesión
                </PillButton>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  ¿No tenés cuenta?{' '}
                  <Link to="/register" className="text-brand-green hover:text-white transition-colors font-medium">
                    Crear cuenta gratis
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            PostCraft © 2024 · Hecho para creadores de contenido
          </p>
        </div>
      </div>
    </div>
  )
}

function GlassField({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-300 mb-1.5 block">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green
          ${error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 hover:border-white/20'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}

function PillButton({ children, loading, ...props }) {
  return (
    <button
      className="group w-full inline-flex items-center justify-between gap-3 rounded-full bg-brand-green text-brand-dark font-semibold pl-6 pr-2 py-2 mt-2
        transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-90 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
      {...props}
    >
      <span>{loading ? 'Ingresando…' : children}</span>
      <span className="w-9 h-9 rounded-full bg-brand-dark/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        )}
      </span>
    </button>
  )
}
