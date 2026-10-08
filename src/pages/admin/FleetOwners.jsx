import { useState } from 'react'
import { Ban, Eye, Users } from 'lucide-react'
import { useFleetOwners } from '../../hooks/useAdmin'
import { formatDate } from '../../utils/formatDate'
import EmptyState from '../../components/EmptyState/EmptyState'
import RowActionsMenu from '../../components/VehicleTable/RowActionsMenu'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import StatusPill from '../../components/ui/StatusPill'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { SearchInput, Toolbar } from '../../components/ui/Toolbar'

const OWNER_ACTIONS = [
  { label: 'View profile', icon: Eye },
  { label: 'Suspend', icon: Ban },
]

// Admin-only page. Two layers protect it:
//   1. RoleRoute in AppRoutes keeps non-admins off this URL (UX).
//   2. getFleetOwners returns 403 for non-admins (security). If you get here
//      by editing your stored role (the tamper test), you'll see that 403
//      rendered by ErrorState below instead of any data.
export default function FleetOwners() {
  const owners = useFleetOwners()
  const [search, setSearch] = useState('')

  const term = search.trim().toLowerCase()
  const visible = (owners.data ?? []).filter((o) => !term || `${o.name} ${o.email}`.toLowerCase().includes(term))

  return (
    <>
      <PageHeader
        title="Fleet Owners"
        subtitle={owners.data ? `${owners.data.length} fleet owners on Zummey` : 'Everyone who manages a fleet on Zummey'}
      />
      <Card>
        {!owners.isError && (
          <Toolbar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" className="w-full sm:w-72" />
          </Toolbar>
        )}

        {owners.isPending ? (
          <TableSkeleton rows={4} columns={7} />
        ) : owners.isError ? (
          <ErrorState error={owners.error} onRetry={owners.refetch} />
        ) : visible.length === 0 ? (
          <EmptyState icon={Users} title={term ? 'No fleet owners match' : 'No fleet owners yet'} description={term ? 'Try a different name or email.' : 'Approved fleet owner sign-ups will appear here.'} />
        ) : (
          <div className="thin-scroll relative overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-slate-400">
                  {['Name', 'Email', 'Phone', 'Vehicles', 'Riders', 'Status', 'Joined'].map((h) => (
                    <th key={h} className={`whitespace-nowrap px-5 py-3 font-medium ${h === 'Vehicles' || h === 'Riders' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((o) => (
                  <tr key={o.id} className="hover:bg-page/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="size-9 shrink-0 rounded-full bg-primary text-white grid place-items-center text-xs font-semibold">
                          {o.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </span>
                        <span className="font-medium text-slate-800">{o.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">{o.email}</td>
                    <td className="whitespace-nowrap px-5 py-3">{o.phone}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{o.vehicleCount}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{o.riderCount}</td>
                    <td className="px-5 py-3"><StatusPill status={o.status} kind="person" /></td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(o.joinedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <RowActionsMenu label={`Actions for ${o.name}`} actions={OWNER_ACTIONS} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
