import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { connectMeta, getProfile, updateProfile } from '../api/auth'
import { getPlans, upgradePlan, openBillingPortal } from '../api/plans'
import useAuthStore from '../store/authStore'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Badge from '../components/UI/Badge'

// Presentation-only hint (color) keyed by plan name. No "popular" flag here —
// that would be a social-proof claim with no real usage data behind it yet;
// add it back once there's real data on which plan people actually choose.
// Everything else (price, limits, features) comes from GET /plans — the
// `plan_limits` DB table is the single source of truth for that data.
const PLAN_DISPLAY = {
  free: { color: 'gray' },
  starter: { color: 'cyan' },
  pro: { color: 'cyan' },
  agency: { color: 'purple' },
}

function planFeatures(plan) {
  const posts = plan.monthlyPosts === null ? 'Posts ilimitados' : `${plan.monthlyPosts} posts/mes`
  const features = [posts, `Redes: ${plan.networks.join(', ')}`]
  features.push(plan.scheduling ? 'Programación de posts' : 'Publicación inmediata')
  return features
}

function Section({ title, desc, children }) {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-1.5">
      <div className="rounded-[1.35rem] bg-brand-surface/80 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-semibold text-white">{title}</h3>
          {desc && <p className="text-sm text-slate-400 mt-0.5">{desc}</p>}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuthStore()

  const { data: plansData } = useQuery({ queryKey: ['plans'], queryFn: getPlans })
  const plans = plansData?.plans || []

  // The store only has whatever was cached at login/OAuth — refresh it here
  // so plan usage and Meta connection status don't go stale for the rest
  // of the session (e.g. after publishing a post or connecting an account).
  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  useEffect(() => {
    if (profileData?.user) updateUser(profileData.user)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData])

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [showDeleteInfo, setShowDeleteInfo] = useState(false)

  // Meta connect
  const connectMetaMutation = useMutation({
    mutationFn: connectMeta,
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
  })

  // Profile update
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      updateUser(data.user || data)
      setProfileSuccess(true)
      setProfileForm((p) => ({ ...p, currentPassword: '', newPassword: '' }))
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  // Upgrade plan: the backend creates a Stripe Checkout session and the
  // plan only actually changes once Stripe confirms payment via webhook,
  // so redirect to Stripe instead of updating local state optimistically.
  const upgradeMutation = useMutation({
    mutationFn: upgradePlan,
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
  })

  // Downgrade to free: there is no direct "set plan to free" endpoint.
  // The user cancels their subscription in the Stripe Customer Portal;
  // the plan flips to free once Stripe's webhook confirms cancellation.
  const portalMutation = useMutation({
    mutationFn: openBillingPortal,
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url
    },
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!profileForm.email) errs.email = 'El email es requerido'
    if (profileForm.newPassword && !profileForm.currentPassword) {
      errs.currentPassword = 'Ingresá tu contraseña actual'
    }
    setProfileErrors(errs)
    if (Object.keys(errs).length === 0) {
      const payload = { name: profileForm.name, email: profileForm.email }
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword
        payload.newPassword = profileForm.newPassword
      }
      profileMutation.mutate(payload)
    }
  }

  const handleProfileChange = (field) => (e) => {
    setProfileForm((p) => ({ ...p, [field]: e.target.value }))
    if (profileErrors[field]) setProfileErrors((p) => ({ ...p, [field]: '' }))
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-3xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-white">Configuración</h2>
        <p className="text-slate-400 text-sm mt-0.5">Gestioná tus cuentas y preferencias</p>
      </div>

      {/* Meta accounts */}
      <Section
        title="Cuentas Meta conectadas"
        desc="Conecta tus cuentas de Instagram y Facebook para publicar directamente"
      >
        <div className="space-y-3">
          {/* Instagram status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">📷</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Instagram</p>
                <p className="text-xs text-slate-400">
                  {user?.instagramConnected
                    ? `@${user.instagramUsername || 'conectado'}`
                    : 'No conectado'}
                </p>
              </div>
            </div>
            <Badge status={user?.instagramConnected ? 'published' : 'draft'}>
              {user?.instagramConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>

          {/* Facebook status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Facebook</p>
                <p className="text-xs text-slate-400">
                  {user?.facebookConnected ? user.facebookPageName || 'conectado' : 'No conectado'}
                </p>
              </div>
            </div>
            <Badge status={user?.facebookConnected ? 'published' : 'draft'}>
              {user?.facebookConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>

          {/* Connect button */}
          <Button
            onClick={() => connectMetaMutation.mutate()}
            loading={connectMetaMutation.isPending}
            variant="outline"
            fullWidth
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Conectar con Meta (Facebook / Instagram)
          </Button>

          {connectMetaMutation.isError && (
            <p className="text-xs text-red-400 text-center">
              Error al conectar. Verificá tu configuración de la app de Meta.
            </p>
          )}
        </div>
      </Section>

      {/* Plan */}
      <Section title="Plan actual" desc="Elegí el plan que mejor se adapte a tus necesidades">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = (user?.plan || 'free') === plan.name
            const display = PLAN_DISPLAY[plan.name] || { color: 'gray' }
            const colorBorder = {
              gray: 'border-slate-600',
              cyan: 'border-brand-green',
              purple: 'border-purple-500',
            }[display.color]

            const colorText = {
              gray: 'text-slate-400',
              cyan: 'text-brand-green',
              purple: 'text-purple-400',
            }[display.color]

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-4 ${
                  isCurrent ? `${colorBorder} bg-brand-dark` : 'border-white/10 bg-black/10'
                } transition-all`}
              >
                <div className="mb-3">
                  <p className={`font-bold text-lg ${colorText}`}>{plan.label}</p>
                  <p className="text-white text-2xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-slate-400">
                      {plan.interval ? `/${plan.interval === 'month' ? 'mes' : plan.interval}` : ''}
                    </span>
                  </p>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {planFeatures(plan).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-brand-green">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="text-center text-xs text-slate-400 py-2 border border-white/10 rounded-full">
                    Plan actual
                  </div>
                ) : plan.name === 'free' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    loading={portalMutation.isPending}
                    onClick={() => portalMutation.mutate()}
                  >
                    Hacer downgrade
                  </Button>
                ) : (
                  <Button
                    variant={display.color === 'cyan' ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    loading={upgradeMutation.isPending}
                    onClick={() => upgradeMutation.mutate({ plan: plan.name })}
                  >
                    Actualizar
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Current usage */}
        <div className="mt-4 p-3 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Uso mensual</p>
            <p className="text-sm font-medium text-white">
              {user?.postsThisMonth || 0} posts publicados este mes
            </p>
          </div>
          <Badge status={user?.plan || 'free'}>{(user?.plan || 'free').toUpperCase()}</Badge>
        </div>

        {upgradeMutation.isError && (
          <p className="text-xs text-red-400 mt-2">
            Error al cambiar el plan. Verificá tu método de pago.
          </p>
        )}
        {portalMutation.isError && (
          <p className="text-xs text-red-400 mt-2">
            {portalMutation.error?.response?.data?.message ||
              'Error al abrir el portal de facturación.'}
          </p>
        )}
      </Section>

      {/* Profile */}
      <Section title="Perfil" desc="Actualiza tu información de cuenta">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileSuccess && (
            <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm">
              ¡Perfil actualizado correctamente!
            </div>
          )}

          {profileMutation.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {profileMutation.error?.response?.data?.message || 'Error al actualizar el perfil.'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={profileForm.name}
              onChange={handleProfileChange('name')}
              placeholder="Tu nombre"
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange('email')}
              error={profileErrors.email}
              placeholder="tu@email.com"
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-slate-400 mb-3">Cambiar contraseña (opcional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contraseña actual"
                type="password"
                value={profileForm.currentPassword}
                onChange={handleProfileChange('currentPassword')}
                error={profileErrors.currentPassword}
                placeholder="••••••••"
              />
              <Input
                label="Nueva contraseña"
                type="password"
                value={profileForm.newPassword}
                onChange={handleProfileChange('newPassword')}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <Button type="submit" loading={profileMutation.isPending} variant="secondary">
            Guardar cambios
          </Button>
        </form>
      </Section>

      {/* Danger zone */}
      <Section title="Zona de peligro">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-400">Eliminar cuenta</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Esta acción es irreversible y eliminará todos tus datos
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteInfo(true)}>
            Eliminar cuenta
          </Button>
        </div>

        {showDeleteInfo && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
            <p className="text-sm text-slate-200">
              Todavía no es un proceso automático — eliminar una cuenta borra tus posts,
              historial y conexiones de forma permanente, así que por ahora lo hacemos
              manualmente para confirmar que sos vos antes de borrar nada.
            </p>
            <p className="text-sm text-slate-400">Escribinos desde el email de tu cuenta y lo resolvemos.</p>
            <button
              onClick={() => setShowDeleteInfo(false)}
              className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-2"
            >
              Cerrar
            </button>
          </div>
        )}
      </Section>
    </div>
  )
}
