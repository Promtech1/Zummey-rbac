import { useState, useSyncExternalStore } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bug, Check, FlaskConical, Loader2, RotateCcw, ShieldQuestion, X } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { getLastMockCall, subscribeToMockCalls } from '../../mocks/mockServer'
import { resetDb } from '../../mocks/mockDb'
import { getFleetOwners } from '../../services/adminService'

// DEV ONLY. Rendered by DashboardLayout only when DEV_TOOLS_ENABLED
// (dev server + mocks), so it never appears in a production build.

const DEV_USERS = [
  { id: 'admin_1', label: 'Admin', name: 'Admin User' },
  { id: 'fm_1', label: 'Fleet Manager A', name: 'Nosa Osagie' },
  { id: 'fm_2', label: 'Fleet Manager B', name: 'Ada Okoro' },
  { id: 'fm_3', label: 'Fleet Manager C', name: 'Emeka Eze' },
]

function describeFilter(call) {
  if (!call) return 'no API calls yet'
  if (call.status === 403) return '403 Forbidden (role not allowed)'
  const entries = Object.entries(call.filter)
  if (entries.length === 0) return `filter: {} (${call.role})`
  return `filter: { ${entries.map(([key, value]) => `${key}: '${value}'`).join(', ')} }`
}

export default function RoleSwitcher() {
  const { user, role, switchSession } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [showDebug, setShowDebug] = useState(true)
  const lastCall = useSyncExternalStore(subscribeToMockCalls, getLastMockCall)
  const [probe, setProbe] = useState(null) // result of the admin-endpoint test

  // Calls an admin-only endpoint directly, skipping the sidebar and RoleRoute,
  // to show the SERVER's answer: 200 for admins, 403 for everyone else.
  async function probeAdminEndpoint() {
    setProbe({ loading: true })
    try {
      const owners = await getFleetOwners()
      setProbe({ ok: true, text: `200 OK · ${owners.length} fleet owners` })
    } catch (error) {
      setProbe({ ok: false, text: `${error.status} · ${error.message}` })
    }
  }

  const switchMutation = useMutation({
    mutationFn: switchSession,
    // Why invalidate everything after a switch?
    // React Query caches responses by key, e.g. ['vehicles']. The key doesn't
    // include the user, so after switching, the cache still holds the
    // PREVIOUS user's vehicles. Invalidating marks every cached query stale:
    // queries on screen refetch right away (now with the new token, so the
    // server returns the new scope), and the rest refetch when next used.
    // A real login/logout goes further and clears the cache completely
    // (see AuthContext), so nothing from one user can leak to the next.
    onSuccess: () => {
      setProbe(null)
      return queryClient.invalidateQueries()
    },
  })

  function handleReset() {
    resetDb() // restore the seed data (keeps sessions, so you stay logged in)
    queryClient.invalidateQueries()
  }

  const current = DEV_USERS.find((u) => u.id === user.id)
  // Frontend role comes from localStorage; server role comes from the token.
  // They only differ if someone edited localStorage (the tamper test).
  const roleMismatch = lastCall && lastCall.userId === user.id && lastCall.role !== role

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-white shadow-lg hover:bg-primary-hover"
      >
        <FlaskConical size={16} />
        <span className="font-medium">DEV</span>
        <span className="text-white/70">{current?.label ?? user.name}</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <FlaskConical size={16} /> Dev role switcher
        </p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 space-y-1.5">
        {DEV_USERS.map((devUser) => {
          const isCurrent = devUser.id === user.id
          const isSwitching = switchMutation.isPending && switchMutation.variables === devUser.id
          return (
            <button
              key={devUser.id}
              type="button"
              disabled={isCurrent || switchMutation.isPending}
              onClick={() => switchMutation.mutate(devUser.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                isCurrent ? 'border-accent bg-accent-soft text-accent' : 'border-line hover:border-primary disabled:opacity-60'
              }`}
            >
              <span>
                <span className="block font-medium">{devUser.label}</span>
                <span className="block text-xs opacity-70">{devUser.name}</span>
              </span>
              {isCurrent && <Check size={16} />}
              {isSwitching && <Loader2 size={16} className="animate-spin" />}
            </button>
          )
        })}
      </div>

      {switchMutation.isError && <p className="mt-2 text-xs text-red-600">{switchMutation.error.message}</p>}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input type="checkbox" checked={showDebug} onChange={(e) => setShowDebug(e.target.checked)} className="accent-primary" />
          <Bug size={14} /> Debug panel
        </label>
        <button type="button" onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary">
          <RotateCcw size={13} /> Reset mock data
        </button>
      </div>

      {showDebug && (
        <dl className="mt-3 space-y-1.5 rounded-xl bg-page p-3 font-mono text-[11px] leading-relaxed text-slate-600">
          <DebugRow label="role (frontend)" value={role} />
          <DebugRow label="user id" value={user.id} />
          <DebugRow label="last call" value={lastCall?.endpoint ?? 'none'} />
          <DebugRow label="server saw" value={lastCall ? `${lastCall.role} · ${lastCall.userId}` : 'none'} />
          <DebugRow label="scope" value={describeFilter(lastCall)} highlight={lastCall?.status === 403} />
          <div className="pt-1 font-sans">
            <button
              type="button"
              onClick={probeAdminEndpoint}
              disabled={probe?.loading}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-primary hover:border-primary"
            >
              {probe?.loading ? <Loader2 size={12} className="animate-spin" /> : <ShieldQuestion size={12} />}
              Call admin-only getFleetOwners()
            </button>
            {probe?.text && (
              <p className={`mt-1 font-mono ${probe.ok ? 'text-green-700' : 'text-red-600'}`}>{probe.text}</p>
            )}
          </div>
          {roleMismatch && (
            <p className="rounded-lg bg-amber-50 px-2 py-1.5 font-sans text-amber-800">
              Frontend role was edited. The server ignored it and used the role from your token.
            </p>
          )}
        </dl>
      )}
    </div>
  )
}

function DebugRow({ label, value, highlight }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-slate-400">{label}</dt>
      <dd className={`min-w-0 break-words ${highlight ? 'text-red-600' : 'text-slate-800'}`}>{value}</dd>
    </div>
  )
}
