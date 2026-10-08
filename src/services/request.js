import { getStoredToken, notifyUnauthorized } from '../auth/sessionStore'

// Mocks are ON unless explicitly turned off with VITE_USE_MOCKS=false.
// (.env is git-ignored, so a fresh clone or a deploy has no VITE_USE_MOCKS;
// defaulting to mocks keeps the app working until a real backend exists.)
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

// Dev tools (RoleSwitcher, loginAs) need BOTH the dev server and the mock
// backend. Always false in a production build.
export const DEV_TOOLS_ENABLED = import.meta.env.DEV && USE_MOCKS

// One error shape for the whole UI: { message, status }.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function toApiError(error) {
  if (error instanceof ApiError) return error
  const status = error.status ?? error.response?.status ?? 0
  const message = error.response?.data?.message ?? error.message ?? 'Something went wrong.'
  return new ApiError(message, status)
}

// Every service function goes through here.
//   callMock(token) -> calls mockServer, passing the token like an auth header
//   callApi()       -> calls axiosInstance (the interceptor adds the token)
// Both paths return the same data and throw the same ApiError, so pages never
// know (or care) which one ran.
export async function request(callMock, callApi) {
  try {
    if (USE_MOCKS) return await callMock(getStoredToken())
    const response = await callApi()
    return response.data
  } catch (error) {
    const apiError = toApiError(error)
    if (apiError.status === 401) notifyUnauthorized()
    throw apiError
  }
}
