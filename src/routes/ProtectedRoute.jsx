import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

// Gate 1: are you logged in at all? If not, go to /login and remember where
// you were heading so Login can send you back afterwards. (Not after a
// deliberate "Log out": the next person to log in may be someone else.)
export default function ProtectedRoute({ children }) {
  const { user, loggedOutManually } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={loggedOutManually ? undefined : { from: location }} />
  return children ?? <Outlet />
}
