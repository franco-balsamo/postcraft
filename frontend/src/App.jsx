import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Sidebar from './components/Layout/Sidebar'
import TopBar from './components/Layout/TopBar'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Posts from './pages/Posts'
import Settings from './pages/Settings'

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
    </BrowserRouter>
  )
}
