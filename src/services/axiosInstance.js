import axios from 'axios'
import { getStoredToken } from '../auth/sessionStore'

// The real HTTP client, used when VITE_USE_MOCKS is not "true".
// VITE_API_URL is optional; set it when a real backend exists.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

// Attach the token to every request, like `Authorization: Bearer <token>`.
// The backend reads the user + role from this token. That's the only
// identity the frontend ever sends.
axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axiosInstance
