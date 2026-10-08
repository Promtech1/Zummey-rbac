import axiosInstance from './axiosInstance'
import { DEV_TOOLS_ENABLED, request } from './request'
import * as mockServer from '../mocks/mockServer'

// Returns { token, user: { id, name, email, role, avatar } }
export const login = (email, password) =>
  request(
    () => mockServer.login(email, password),
    () => axiosInstance.post('/auth/login', { email, password }),
  )

export const logout = () =>
  request(
    (token) => mockServer.logout(token),
    () => axiosInstance.post('/auth/logout'),
  )

// DEV-ONLY SHORTCUT (see mockServer.loginAs). Become another user without a
// password, for the RoleSwitcher. There is deliberately no axios branch: a
// real backend has no such endpoint. Null outside dev + mocks.
export const loginAs = DEV_TOOLS_ENABLED
  ? (userId) => request(() => mockServer.loginAs(userId))
  : null
