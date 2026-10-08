import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

// Gate 2: is your role allowed on this route?
//
// This is UX, NOT security. It stops a fleet manager from landing on a page
// that would only show errors, and it gives a clear "not allowed" message.
// But all of this code runs in the user's browser, where it can be edited or
// skipped. The real protection is the server refusing the data (see the 403
// in mocks/mockServer.js). Always enforce on the backend; mirror it here.
export default function RoleRoute({ allowedRoles, children }) {
  const { role } = useAuth()

  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />
  return children ?? <Outlet />
}
