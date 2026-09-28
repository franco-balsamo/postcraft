import { useLocation, useNavigate } from 'react-router-dom'
import Badge from '../UI/Badge'
import useAuthStore from '../../store/authStore'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/editor': 'Editor de Posts',
  '/posts': 'Historial de Posts',
  '/settings': 'Configuración',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const title = routeTitles[location.pathname] || 'PostCraft'

  return (
    <header className="h-14 bg-brand-navy/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Logo (mobile only) + page title */}
      <div className="flex items-center gap-3">
        {/* Logo mark — only visible on mobile where sidebar is hidden */}
        <div className="lg:hidden w-7 h-7 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
          <span className="text-brand-dark font-black text-xs">PC</span>
        </div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {location.pathname === '/editor' && <Badge variant="blue">Beta</Badge>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Plan badge — hidden on very small screens */}
        {user?.plan && (
          <Badge status={user.plan} className="capitalize hidden sm:inline-flex">
            {user.plan}
          </Badge>
        )}

        {/* Create post shortcut */}
        {location.pathname !== '/editor' && (
          <button
            onClick={() => navigate('/editor')}
            className="group flex items-center gap-2 pl-3 pr-1.5 lg:pl-3.5 lg:pr-1.5 py-1.5 bg-brand-green text-brand-dark text-xs font-semibold rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-90 active:scale-[0.98]"
          >
            <span className="hidden sm:inline">Nuevo post</span>
            <span className="w-6 h-6 rounded-full bg-brand-dark/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>
          </button>
        )}
      </div>
    </header>
  )
}
