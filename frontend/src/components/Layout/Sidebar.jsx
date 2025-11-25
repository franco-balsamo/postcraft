import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import useAuthStore from '../../store/authStore'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/editor',
    label: 'Editor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    to: '/posts',
    label: 'Posts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Config.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

const PLAN_LIMITS = { free: 10, pro: 100, enterprise: Infinity }

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const planLimit = user?.plan ? PLAN_LIMITS[user.plan] : 10
  const postsUsed = user?.postsThisMonth || 0
  const usagePercent = planLimit === Infinity ? 0 : Math.min(100, (postsUsed / planLimit) * 100)
  const postsLeft = Math.max(0, planLimit - postsUsed)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Desktop sidebar (lg+) ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 h-screen bg-brand-navy border-r border-brand-border flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center">
              <span className="text-brand-dark font-black text-sm">PC</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">PostCraft</p>
              <p className="text-xs text-slate-500">Social Media Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                    : 'text-slate-400 hover:text-white hover:bg-brand-surface'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Plan info */}
        <div className="p-4 border-t border-brand-border space-y-3">
          <div className="bg-brand-surface rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Plan actual</span>
              <span className="text-xs font-semibold text-brand-green capitalize">
                {user?.plan || 'free'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Posts este mes</span>
              <span>{postsUsed}/{planLimit === Infinity ? '∞' : planLimit}</span>
            </div>
            {planLimit !== Infinity && (
              <div className="w-full bg-brand-border rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-brand-green to-brand-cyan transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
            {planLimit !== Infinity && postsLeft <= 2 && (
              <p className="text-xs text-yellow-400">
                Solo {postsLeft} post{postsLeft !== 1 ? 's' : ''} restante{postsLeft !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-brand-dark text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.name || user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom navigation (< lg) ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-navy border-t border-brand-border flex items-center justify-around px-2 py-1 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all min-w-0',
                isActive ? 'text-brand-green' : 'text-slate-500'
              )
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Logout on mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </>
  )
}
