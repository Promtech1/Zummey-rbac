import { useState } from 'react'
import { Check, CircleCheck, UserCheck, X } from 'lucide-react'
import { ROLES, ROLE_LABELS } from '../../auth/roles'
import { useApprovePendingUser, usePendingUsers, useRejectPendingUser } from '../../hooks/useAdmin'
import { formatDateTime } from '../../utils/formatDate'
import EmptyState from '../../components/EmptyState/EmptyState'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import { TableSkeleton } from '../../components/ui/Skeleton'
import ConfirmRejectModal from './modals/ConfirmRejectModal'

// Admin-only page (RoleRoute + a server-side 403, same as FleetOwners).
// Approve/Reject are React Query mutations. On success they invalidate the
// ['admin'] queries, so this list refetches and the handled user disappears.
export default function PendingUsers() {
  const pending = usePendingUsers()
  const approve = useApprovePendingUser()
  const reject = useRejectPendingUser()
  const [notice, setNotice] = useState(null) // last success message
  const [rejectTarget, setRejectTarget] = useState(null) // user awaiting reject confirmation

  // Which row is busy, and doing what (so only that row shows a spinner).
  const busyId = approve.isPending ? approve.variables : reject.isPending ? reject.variables : null
  const actionError = approve.error // reject errors show inside the confirm modal

  function handleApprove(user) {
    reject.reset()
    approve.mutate(user.id, {
      onSuccess: () =>
        setNotice(
          user.roleRequested === ROLES.FLEET_MANAGER
            ? `${user.name} is now a fleet owner and can log in (mock password: password123).`
            : `${user.name} was added as a rider in ${user.fleetOwnerName}'s fleet.`,
        ),
    })
  }

  // Reject asks first (it can't be undone); the mutation runs on confirm.
  function askToReject(user) {
    approve.reset()
    reject.reset()
    setRejectTarget(user)
  }

  function confirmReject() {
    const user = rejectTarget
    reject.mutate(user.id, {
      onSuccess: () => {
        setRejectTarget(null)
        setNotice(`${user.name}'s request was rejected.`)
      },
    })
  }

  return (
    <>
      <PageHeader
        title="Pending Users"
        subtitle={pending.data ? `${pending.data.length} awaiting approval` : 'Sign-ups waiting for an admin to approve them'}
      />

      {notice && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <CircleCheck size={18} className="mt-px shrink-0" />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="text-green-700/70 hover:text-green-900">
            <X size={16} />
          </button>
        </div>
      )}
      {actionError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError.status === 403 ? 'Forbidden (403): only admins can approve or reject users.' : actionError.message}
        </p>
      )}

      <Card>
        {pending.isPending ? (
          <TableSkeleton rows={4} columns={5} />
        ) : pending.isError ? (
          <ErrorState error={pending.error} onRetry={pending.refetch} />
        ) : pending.data.length === 0 ? (
          <EmptyState icon={UserCheck} title="All caught up" description="There are no sign-ups waiting for approval." />
        ) : (
          <div className="thin-scroll relative overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-slate-400">
                  {['Name', 'Role requested', 'Email', 'Date requested'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                  ))}
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pending.data.map((user) => {
                  const busy = busyId === user.id
                  return (
                    <tr key={user.id} className={busy ? 'opacity-60' : 'hover:bg-page/60'}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.phone}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${user.roleRequested === ROLES.FLEET_MANAGER ? 'bg-badge-purple text-badge-purple-fg' : 'bg-badge-blue text-badge-blue-fg'}`}>
                          {ROLE_LABELS[user.roleRequested]}
                        </span>
                        {user.fleetOwnerName && <span className="ml-2 text-xs text-slate-400">for {user.fleetOwnerName}</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">{user.email}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDateTime(user.requestedAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="danger"
                            icon={X}
                            className="px-3 py-1.5"
                            disabled={Boolean(busyId)}
                            loading={busy && reject.isPending}
                            onClick={() => askToReject(user)}
                          >
                            Reject
                          </Button>
                          <Button
                            icon={Check}
                            className="px-3 py-1.5"
                            disabled={Boolean(busyId)}
                            loading={busy && approve.isPending}
                            onClick={() => handleApprove(user)}
                          >
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {rejectTarget && (
        <ConfirmRejectModal
          user={rejectTarget}
          loading={reject.isPending}
          error={reject.error}
          onCancel={() => setRejectTarget(null)}
          onConfirm={confirmReject}
        />
      )}
    </>
  )
}
