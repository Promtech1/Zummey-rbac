import { useState } from 'react'
import { Car, Plus } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useRiders } from '../../hooks/useRiders'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { cleanParams } from '../../utils/cleanParams'
import { formatDate } from '../../utils/formatDate'
import EmptyState from '../../components/EmptyState/EmptyState'
import FleetOwnerFilter from '../../components/FleetOwnerFilter/FleetOwnerFilter'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import StatusPill from '../../components/ui/StatusPill'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { SearchInput, Toolbar } from '../../components/ui/Toolbar'
import AddRiderModal from './modals/AddRiderModal'

export default function Riders() {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN

  const [search, setSearch] = useState('')
  const [fleetOwnerId, setFleetOwnerId] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const riders = useRiders(cleanParams({ search: debouncedSearch, fleetManagerId: fleetOwnerId }))
  const isFiltered = Boolean(debouncedSearch || fleetOwnerId)
  // "No riders at all" (show the big empty state) vs "no riders match the filter".
  const hasNoRiders = riders.isSuccess && riders.data.length === 0 && !isFiltered

  const addButton = <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Rider</Button>

  return (
    <>
      <PageHeader title={isAdmin ? 'Riders' : 'Riders Management'} subtitle={isAdmin ? 'Riders across all fleet owners' : 'Riders in your fleet'}>
        {addButton}
      </PageHeader>

      <Card>
        {!hasNoRiders && (
          <Toolbar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone…" className="w-full sm:w-72" />
            <FleetOwnerFilter value={fleetOwnerId} onChange={setFleetOwnerId} />
            {riders.data && (
              <span className="ml-auto text-sm text-slate-400">
                {riders.data.length} rider{riders.data.length === 1 ? '' : 's'}
              </span>
            )}
          </Toolbar>
        )}

        {riders.isPending ? (
          <TableSkeleton rows={6} columns={7} />
        ) : riders.isError ? (
          <ErrorState error={riders.error} onRetry={riders.refetch} />
        ) : hasNoRiders ? (
          <EmptyState
            icon={Car}
            title="No Drivers Added Yet"
            description="You haven't added any drivers to your fleet. Add a driver to start assigning vehicles."
            action={addButton}
            className="py-20"
          />
        ) : riders.data.length === 0 ? (
          <EmptyState title="No riders match" description="Try a different search or fleet owner." />
        ) : (
          <RidersTable riders={riders.data} showFleetOwner={isAdmin} />
        )}
      </Card>

      {showAddModal && <AddRiderModal onClose={() => setShowAddModal(false)} />}
    </>
  )
}

function RidersTable({ riders, showFleetOwner }) {
  const headers = ['Rider', 'Phone', 'License No.', 'Vehicle', 'Status', ...(showFleetOwner ? ['Fleet Owner'] : []), 'Joined']
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-slate-400">
            {headers.map((h) => <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {riders.map((r) => (
            <tr key={r.id} className="hover:bg-page/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="size-9 shrink-0 rounded-full bg-badge-purple text-badge-purple-fg grid place-items-center text-xs font-semibold">
                    {r.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{r.name}</p>
                    <p className="truncate text-xs text-slate-400">{r.email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-3">{r.phone}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">{r.licenseNo}</td>
              <td className="whitespace-nowrap px-5 py-3">{r.vehicleBikeId ?? <span className="text-slate-400">None</span>}</td>
              <td className="px-5 py-3"><StatusPill status={r.status} kind="person" /></td>
              {showFleetOwner && <td className="whitespace-nowrap px-5 py-3">{r.fleetOwnerName}</td>}
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(r.joinedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
