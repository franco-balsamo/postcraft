import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { connectMeta, updateProfile, getProfile } from '../api/auth'
import { getPlans, upgradePlan } from '../api/plans'
import useAuthStore from '../store/authStore'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import Badge from '../components/UI/Badge'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mes',
    features: ['10 posts/mes', '1 cuenta Meta', 'Templates básicos', 'Descarga PNG'],
    color: 'gray',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/mes',
    features: ['100 posts/mes', '3 cuentas Meta', 'Templates premium', 'Programación', 'Sin marca de agua'],
    color: 'cyan',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$49',
    period: '/mes',
    features: ['Posts ilimitados', 'Cuentas ilimitadas', 'Templates exclusivos', 'API access', 'Soporte prioritario'],
    color: 'purple',
  },
]

function Section({ title, desc, children }) {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-brand-border">
        <h3 className="font-semibold text-white">{title}</h3>
        {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileSuccess, setProfileSuccess] = useState(false)

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

  // Upgrade plan
  const upgradeMutation = useMutation({
    mutationFn: upgradePlan,
    onSuccess: (data) => {
      updateUser({ plan: data.plan })
      queryClient.invalidateQueries({ queryKey: ['plans'] })
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
        <p className="text-slate-500 text-sm mt-0.5">Gestioná tus cuentas y preferencias</p>
      </div>

      {/* Meta accounts */}
      <Section
        title="Cuentas Meta conectadas"
        desc="Conecta tus cuentas de Instagram y Facebook para publicar directamente"
      >
        <div className="space-y-3">
          {/* Instagram status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-brand-dark border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">📷</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Instagram</p>
                <p className="text-xs text-slate-500">
                  {user?.instagramConnected ? `@${user.instagramUsername || 'conectado'}` : 'No conectado'}
                </p>
              </div>
            </div>
            <Badge status={user?.instagramConnected ? 'published' : 'draft'}>
              {user?.instagramConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>

          {/* Facebook status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-brand-dark border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Facebook</p>
                <p className="text-xs text-slate-500">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
      <Section
        title="Plan actual"
        desc="Elegí el plan que mejor se adapte a tus necesidades"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = (user?.plan || 'free') === plan.id
            const colorBorder = {
              gray: 'border-slate-600',
              cyan: 'border-brand-cyan',
              purple: 'border-purple-500',
            }[plan.color]

            const colorText = {
              gray: 'text-slate-400',
              cyan: 'text-brand-cyan',
              purple: 'text-purple-400',
            }[plan.color]

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-4 ${
                  isCurrent
                    ? `${colorBorder} bg-brand-dark`
                    : 'border-brand-border bg-brand-dark/50'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 bg-brand-cyan text-brand-dark text-xs font-bold rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <p className={`font-bold text-lg ${colorText}`}>{plan.name}</p>
                  <p className="text-white text-2xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-slate-500">{plan.period}</span>
                  </p>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-brand-green">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="text-center text-xs text-slate-500 py-2 border border-brand-border rounded-lg">
                    Plan actual
                  </div>
                ) : (
                  <Button
                    variant={plan.color === 'cyan' ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    loading={upgradeMutation.isPending}
                    onClick={() => upgradeMutation.mutate({ planId: plan.id })}
                  >
                    {plan.id === 'free' ? 'Hacer downgrade' : 'Actualizar'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Current usage */}
        <div className="mt-4 p-3 rounded-lg bg-brand-dark border border-brand-border flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Uso mensual</p>
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
        {upgradeMutation.isSuccess && (
          <p className="text-xs text-brand-green mt-2">Plan actualizado correctamente.</p>
        )}
      </Section>

      {/* Profile */}
      <Section
        title="Perfil"
        desc="Actualiza tu información de cuenta"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileSuccess && (
            <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm">
              ¡Perfil actualizado correctamente!
            </div>
          )}

          {profileMutation.isError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
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

          <div className="pt-2 border-t border-brand-border">
            <p className="text-xs text-slate-500 mb-3">Cambiar contraseña (opcional)</p>
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

          <Button
            type="submit"
            loading={profileMutation.isPending}
            variant="secondary"
          >
            Guardar cambios
          </Button>
        </form>
      </Section>

      {/* Danger zone */}
      <Section title="Zona de peligro">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">Eliminar cuenta</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta acción es irreversible y eliminará todos tus datos
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => alert('Contacta soporte para eliminar tu cuenta.')}>
            Eliminar cuenta
          </Button>
        </div>
      </Section>
    </div>
  )
}
