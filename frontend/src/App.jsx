import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Sidebar from './components/Layout/Sidebar'
import TopBar from './components/Layout/TopBar'

// Route-level code splitting: each page ships in its own chunk, so a first
// visit to /login doesn't also download the Editor, Posts and Settings code.
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Editor = lazy(() => import('./pages/Editor'))
const Posts = lazy(() => import('./pages/Posts'))
const Settings = lazy(() => import('./pages/Settings'))

function RouteFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-brand-dark">
      <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brand-green animate-spin" />
    </div>
  )
}

// Protected layout: Sidebar + TopBar + content
function ProtectedLayout() {
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        {/* pb-16 on mobile reserves space for the bottom nav bar */}
        <main className="flex-1 flex overflow-hidden pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Root redirect
function RootRedirect() {
  const token = useAuthStore((s) => s.token)
  return <Navigate to={token ? '/editor' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
