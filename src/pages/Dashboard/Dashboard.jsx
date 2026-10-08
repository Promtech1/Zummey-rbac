import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bike, CircleCheck, CirclePause, Package } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useVehicles } from '../../hooks/useVehicles'
import { useOrders } from '../../hooks/useOrders'
import StatCard from '../../components/StatCard/StatCard'
import VehicleTable from '../../components/VehicleTable/VehicleTable'
import OrderCard, { OrderCardSkeleton } from '../../components/OrderCard/OrderCard'
import TripMap from '../../components/TripMap/TripMap'
import EmptyState from '../../components/EmptyState/EmptyState'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { SearchInput } from '../../components/ui/Toolbar'

const PREVIEW_ROWS = 5

// Same component for every role. Nothing here filters by fleet manager:
// the server already returned admin totals or this manager's own slice.
export default function Dashboard() {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN

  const stats = useDashboardStats()
  const activeVehicles = useVehicles({ status: 'active' })
  const ongoingOrders = useOrders({ status: 'ongoing' })

  const [orderSearch, setOrderSearch] = useState('')
  const [focusedOrderId, setFocusedOrderId] = useState(null)

  const orders = ongoingOrders.data ?? []
  const visibleOrders = orders.filter((o) => o.id.toLowerCase().includes(orderSearch.trim().toLowerCase()))
  const toggleFocus = (id) => setFocusedOrderId((current) => (current === id ? null : id))

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      {stats.isError ? (
        <Card><ErrorState error={stats.error} onRetry={stats.refetch} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Vehicles" value={stats.data?.totalVehicles} icon={Bike} tone="orange" loading={stats.isPending} hint={isAdmin ? 'Across all fleet owners' : undefined} />
          <StatCard label="Active Vehicles" value={stats.data?.activeVehicles} icon={CircleCheck} tone="purple" loading={stats.isPending} />
          <StatCard label="Inactive Vehicles" value={stats.data?.inactiveVehicles} icon={CirclePause} tone="blue" loading={stats.isPending} />
        </div>
      )}

      {/* Active vehicles preview */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-primary">Active Vehicles</h2>
          <Link to="/fleet-management" className="text-sm font-medium text-accent hover:underline">View All</Link>
        </div>
        {activeVehicles.isPending ? (
          <TableSkeleton rows={4} columns={8} />
        ) : activeVehicles.isError ? (
          <ErrorState error={activeVehicles.error} onRetry={activeVehicles.refetch} />
        ) : activeVehicles.data.length === 0 ? (
          <EmptyState icon={Bike} title="No active vehicles" description="Vehicles show up here once a rider is assigned and they come online." />
        ) : (
          <VehicleTable vehicles={activeVehicles.data.slice(0, PREVIEW_ROWS)} showFleetOwner={isAdmin} />
        )}
      </Card>

      {/* Ongoing orders + map */}
      <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <Card className="flex h-[540px] flex-col">
          <div className="space-y-3 border-b border-line p-4">
            <h2 className="font-semibold text-primary">Ongoing Order</h2>
            <SearchInput value={orderSearch} onChange={setOrderSearch} placeholder="Search by Order ID" />
          </div>
          <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
            {ongoingOrders.isPending ? (
              <>
                <OrderCardSkeleton />
                <OrderCardSkeleton />
              </>
            ) : ongoingOrders.isError ? (
              <ErrorState error={ongoingOrders.error} onRetry={ongoingOrders.refetch} />
            ) : visibleOrders.length === 0 ? (
              <EmptyState icon={Package} title={orderSearch ? 'No matching orders' : 'No ongoing orders'} description={orderSearch ? 'Try a different Order ID.' : 'Orders in progress will appear here.'} />
            ) : (
              visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} active={order.id === focusedOrderId} onSelect={toggleFocus} />
              ))
            )}
          </div>
        </Card>

        <Card className="h-[360px] overflow-hidden sm:h-[540px]">
          <TripMap trips={visibleOrders} focusedId={focusedOrderId} onSelectTrip={toggleFocus} />
        </Card>
      </div>
    </div>
  )
}
