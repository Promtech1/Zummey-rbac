import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authService from '../services/authService'
import { AuthContext } from './useAuth'
import {
  UNAUTHORIZED_EVENT,
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from './sessionStore'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  // Start from whatever was saved, so refresh keeps you logged in.
  const [session, setSession] = useState(readStoredSession)
  // True after clicking "Log out". ProtectedRoute uses it to NOT remember the
  // current page: otherwise the next person to log in would be sent back to
  // it (e.g. a fleet manager landing on an admin page -> /unauthorized).
  // After a 401 (expired session) it stays false, because the same person
  // usually logs back in and should return to where they were.
  const [loggedOutManually, setLoggedOutManually] = useState(false)

  const startSession = useCallback((newSession) => {
    writeStoredSession(newSession)
    setLoggedOutManually(false)
    setSession(newSession)
  }, [])

  const endSession = useCallback((reason) => {
    clearStoredSession()
    setLoggedOutManually(reason === 'manual')
    setSession(null)
    // Drop every cached response so the next user never sees this user's data.
    queryClient.clear()
  }, [queryClient])

  const login = useCallback(
    async (email, password) => {
      const result = await authService.login(email, password) // { token, user }
      queryClient.clear()
      startSession(result)
      return result.user
    },
    [queryClient, startSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // token already invalid: we log out locally either way
    }
    endSession('manual')
  }, [endSession])

  // Dev-only: the RoleSwitcher uses this to become another user without
  // typing a password. The server still issues a real session token, so
  // data scoping keeps coming from the server. Cache handling is the
  // caller's job.
  const switchSession = useCallback(
    async (userId) => {
      if (!authService.loginAs) throw new Error('Role switching only works in dev with mocks.')
      const result = await authService.loginAs(userId)
      startSession(result)
      return result.user
    },
    [startSession],
  )

  // Any API call that gets a 401 (expired/unknown token) logs us out.
  useEffect(() => {
    const handleUnauthorized = () => endSession('expired')
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [endSession])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      role: session?.user?.role ?? null,
      loggedOutManually,
      login,
      logout,
      switchSession,
    }),
    [session, loggedOutManually, login, logout, switchSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
