import { createContext, useContext } from 'react'

// The context object lives here (not in AuthContext.jsx) so that file only
// exports components, which keeps Vite's fast refresh working.
export const AuthContext = createContext(null)

// Read the auth state anywhere: const { user, role, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
