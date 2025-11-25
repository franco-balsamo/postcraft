import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getPosts } from '../api/posts'
import useAuthStore from '../store/authStore'
import Button from '../components/UI/Button'
import Badge from '../components/UI/Badge'

const PLAN_LIMITS = { free: 10, pro: 100, enterprise: Infinity }

function StatCard({ label, value, sub, icon, color = 'green' }) {
  const colorClasses = {
    green: 'from-brand-green/20 to-brand-green/5 border-brand-green/20 text-brand-green',
    cyan: 'from-brand-cyan/20 to-brand-cyan/5 border-brand-cyan/20 text-brand-cyan',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    yellow: 'from-yellow-400/20 to-yellow-400/5 border-yellow-400/20 text-yellow-400',
  }
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ').at(-1)}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const planLimit = user?.plan ? PLAN_LIMITS[user.plan] : 10
  const postsUsed = user?.postsThisMonth || 0
  const postsLeft = planLimit === Infinity ? '∞' : Math.max(0, planLimit - postsUsed)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: false,
  })

  const { data: recentData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', { page: 1 }],
    queryFn: () => getPosts({ page: 1 }),
    retry: false,
  })

  const recentPosts = recentData?.posts?.slice(0, 5) || []

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Hola, {user?.name || user?.email?.split('@')[0]} 👋
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Acá está el resumen de tu actividad
          </p>
        </div>
        <Button onClick={() => navigate('/editor')} size="lg" className="self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear nuevo post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Posts este mes"
          value={statsLoading ? '...' : (stats?.postsThisMonth ?? postsUsed)}
          sub={`de ${planLimit === Infinity ? '∞' : planLimit} permitidos`}
          icon="📊"
          color="green"
        />
        <StatCard
          label="Posts restantes"
          value={statsLoading ? '...' : (typeof postsLeft === 'number' ? postsLeft : '∞')}
          sub="en tu plan actual"
          icon="⚡"
          color="cyan"
        />
        <StatCard
          label="Redes conectadas"
          value={statsLoading ? '...' : (stats?.connectedNetworks ?? 0)}
          sub="Instagram / Facebook"
          icon="🔗"
          color="purple"
        />
        <StatCard
          label="Plan actual"
          value={(user?.plan || 'free').toUpperCase()}
          sub="Gestiona tu plan"
          icon="💎"
          color="yellow"
        />
      </div>

      {/* Usage bar */}
      {planLimit !== Infinity && (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white">Uso mensual de posts</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {postsUsed} de {planLimit} posts usados este mes
              </p>
            </div>
            <Badge status={user?.plan}>{(user?.plan || 'free').toUpperCase()}</Badge>
          </div>
          <div className="w-full bg-brand-border rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-brand-green to-brand-cyan transition-all"
              style={{ width: `${Math.min(100, (postsUsed / planLimit) * 100)}%` }}
            />
          </div>
          {planLimit - postsUsed <= 3 && planLimit - postsUsed > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-yellow-400">
                ¡Solo te quedan {planLimit - postsUsed} posts! Considera hacer upgrade.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                Upgrade
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recent posts */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-semibold text-white">Posts recientes</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/posts')}>
            Ver todos →
          </Button>
        </div>

        {postsLoading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando posts...
            </div>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-slate-400 font-medium mb-1">Todavía no creaste ningún post</p>
            <p className="text-slate-600 text-sm mb-4">
              Empieza creando tu primer diseño
            </p>
            <Button onClick={() => navigate('/editor')}>Crear primer post</Button>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {recentPosts.map((post) => (
              <div key={post.id || post._id} className="p-4 flex items-center gap-4 hover:bg-brand-dark/40 transition-colors">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-brand-dark border border-brand-border flex items-center justify-center flex-shrink-0">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-lg">{post.templateType === 'story' ? '▯' : '□'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">
                    {post.caption || `${post.templateType} · ${post.templateName}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge status={post.status} className="text-xs">
                      {post.status === 'published' ? 'Publicado' : post.status === 'scheduled' ? 'Programado' : post.status || 'Borrador'}
                    </Badge>
                    <span className="text-xs text-slate-600">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('es-AR')
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Networks */}
                {post.networks?.length > 0 && (
                  <div className="flex gap-1 flex-shrink-0">
                    {post.networks.map((n) => (
                      <span key={n} className="text-sm" title={n}>
                        {n === 'instagram' ? '📷' : '👤'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '🎨',
            title: 'Editor de posts',
            desc: 'Crea diseños en segundos',
            action: () => navigate('/editor'),
          },
          {
            icon: '📋',
            title: 'Ver historial',
            desc: 'Todos tus posts publicados',
            action: () => navigate('/posts'),
          },
          {
            icon: '⚙️',
            title: 'Configuración',
            desc: 'Conecta tus cuentas Meta',
            action: () => navigate('/settings'),
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className="text-left p-5 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-green/40 hover:bg-brand-green/5 transition-all group"
          >
            <span className="text-3xl block mb-3">{item.icon}</span>
            <p className="font-semibold text-white group-hover:text-brand-green transition-colors">
              {item.title}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
