import { isAdminRole } from '../services/admin'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export function ProtectedRoute({ role }: { role: 'STUDENT' | 'ADMIN' }) {
  const { user, loading, sessionError, retrySession } = useAppState()
  const location = useLocation()
  if (loading) return <div className="cent-loading" role="status">در حال بررسی حساب…</div>
  if (sessionError) return <div className="cent-error" role="alert"><p>{sessionError}</p><button className="button button-primary" onClick={retrySession}>بررسی دوباره حساب</button></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (role === 'ADMIN' ? !isAdminRole(user.role) : user.role !== 'STUDENT') return <Navigate to={isAdminRole(user.role) ? '/admin' : '/student'} replace />
  return <Outlet />
}
