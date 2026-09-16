import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export function ProtectedRoute({ role }: { role: 'STUDENT' | 'ADMIN' }) {
  const { user } = useAppState()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
  return <Outlet />
}
