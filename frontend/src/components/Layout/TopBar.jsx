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
    <header className="h-14 bg-brand-navy border-b border-brand-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Logo (mobile only) + page title */}
      <div className="flex items-center gap-3">
        {/* Logo mark — only visible on mobile where sidebar is hidden */}
        <div className="lg:hidden w-7 h-7 rounded-md bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center flex-shrink-0">
          <span className="text-brand-dark font-black text-xs">PC</span>
        </div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {location.pathname === '/editor' && (
          <Badge variant="cyan">Beta</Badge>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Plan badge — hidden on very small screens */}
        {user?.plan && (
          <Badge status={user.plan} className="capitalize hidden sm:inline-flex">
            {user.plan}
          </Badge>
        )}

        {/* Notification bell */}
        <button className="text-slate-500 hover:text-slate-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Create post shortcut */}
        {location.pathname !== '/editor' && (
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-gradient-to-r from-brand-green to-brand-cyan text-brand-dark text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuevo post</span>
          </button>
        )}
      </div>
    </header>
  )
}
