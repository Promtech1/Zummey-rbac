import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useOrders } from '../../hooks/useOrders'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { cleanParams } from '../../utils/cleanParams'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import EmptyState from '../../components/EmptyState/EmptyState'
import FleetOwnerFilter from '../../components/FleetOwnerFilter/FleetOwnerFilter'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import StatusPill from '../../components/ui/StatusPill'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { FilterSelect, SearchInput, Toolbar } from '../../components/ui/Toolbar'

export default function OrderList() {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [fleetOwnerId, setFleetOwnerId] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const orders = useOrders(cleanParams({ search: debouncedSearch, status, fleetManagerId: fleetOwnerId }))
  const headers = ['Order ID', 'Status', 'Rider', 'Pickup', 'Destination', 'Date', 'Amount', ...(isAdmin ? ['Fleet Owner'] : [])]

  return (
    <>
      <PageHeader title="Order List" subtitle={isAdmin ? 'Orders across all fleet owners' : 'Orders handled by your fleet'} />
      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by Order ID" className="w-full sm:w-64" />
          <FilterSelect label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
          <FleetOwnerFilter value={fleetOwnerId} onChange={setFleetOwnerId} />
        </Toolbar>

        {orders.isPending ? (
          <TableSkeleton rows={8} columns={7} />
        ) : orders.isError ? (
          <ErrorState error={orders.error} onRetry={orders.refetch} />
        ) : orders.data.length === 0 ? (
          <EmptyState icon={Package} title="No orders found" description={debouncedSearch || status || fleetOwnerId ? 'Try a different search or filter.' : 'Orders will appear here once your riders start delivering.'} />
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-slate-400">
                  {headers.map((h) => <th key={h} className={`whitespace-nowrap px-5 py-3 font-medium ${h === 'Amount' ? 'text-right' : ''}`}>{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.data.map((o) => (
                  <tr key={o.id} className="hover:bg-page/60">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-primary">
                      {o.status === 'ongoing' ? <Link to={`/orders/track?order=${o.id}`} className="hover:text-accent">#{o.id}</Link> : `#${o.id}`}
                    </td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                    <td className="whitespace-nowrap px-5 py-3">{o.riderName}</td>
                    <td className="max-w-[200px] truncate px-5 py-3" title={o.pickup.address}>{o.pickup.address}</td>
                    <td className="max-w-[200px] truncate px-5 py-3" title={o.destination.address}>{o.destination.address}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDateTime(o.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums">{formatCurrency(o.amount)}</td>
                    {isAdmin && <td className="whitespace-nowrap px-5 py-3">{o.fleetOwnerName}</td>}
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
