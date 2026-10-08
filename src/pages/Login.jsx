import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Bike, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { USE_MOCKS } from '../services/request'

const DEMO_PASSWORD = 'password123'
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@zummey.com' },
  { label: 'Fleet Manager A: Nosa', email: 'fleet1@zummey.com' },
  { label: 'Fleet Manager B: Ada', email: 'fleet2@zummey.com' },
  { label: 'Fleet Manager C: Emeka', email: 'fleet3@zummey.com' },
]

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Logging in is a write (it creates a session), so it's a mutation.
  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
  })

  // Once logged in, go back to the page ProtectedRoute sent us away from.
  if (user) {
    const from = location.state?.from?.pathname ?? '/dashboard'
    return <Navigate to={from} replace />
  }

  function handleSubmit(event) {
    event.preventDefault()
    loginMutation.mutate()
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    loginMutation.reset()
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

  return (
    <div className="bg-white rounded-2xl border border-line p-6 sm:p-8 lg:border-0 lg:p-0">
      <div className="flex items-center gap-2 lg:hidden mb-6">
        <span className="size-8 rounded-lg bg-accent text-white grid place-items-center">
          <Bike size={18} />
        </span>
        <span className="text-lg font-semibold text-primary">Zummey</span>
      </div>

      <h1 className="text-primary font-semibold text-[clamp(1.5rem,1.5vw+1rem,2rem)]">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to manage your fleet.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={`${inputClass} mt-1.5`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {loginMutation.isError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-px" />
            {loginMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
          {loginMutation.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {USE_MOCKS && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-page p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Demo accounts · password <code className="text-primary">{DEMO_PASSWORD}</code>
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account.email)}
                className="rounded-lg bg-white border border-line px-3 py-2 text-left text-xs hover:border-accent hover:text-accent transition"
              >
                <span className="block font-medium">{account.label}</span>
                <span className="block text-slate-400">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
