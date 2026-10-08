import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListFilter, Package, X } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { formatCurrency } from '../../utils/formatCurrency'
import OrderCard, { OrderCardSkeleton } from '../../components/OrderCard/OrderCard'
import TripMap from '../../components/TripMap/TripMap'
import EmptyState from '../../components/EmptyState/EmptyState'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import { SearchInput } from '../../components/ui/Toolbar'

export default function TrackOrders() {
  // The focused trip lives in the URL (?order=ZM-10231), so "View Details"
  // links from the dashboard open this page with that trip already focused.
  const [searchParams, setSearchParams] = useSearchParams()
  const focusedId = searchParams.get('order')
  const setFocusedId = (id) => setSearchParams(id && id !== focusedId ? { order: id } : {}, { replace: true })

  const [search, setSearch] = useState('')
  const ongoingOrders = useOrders({ status: 'ongoing' })
  const orders = (ongoingOrders.data ?? []).filter((o) => o.id.toLowerCase().includes(search.trim().toLowerCase()))
  const focused = orders.find((o) => o.id === focusedId)

  return (
    <div className="flex h-full min-h-[560px] flex-col gap-4 lg:flex-row">
      <Card className="flex max-h-[70vh] w-full shrink-0 flex-col lg:max-h-none lg:w-[380px]">
        <div className="space-y-3 border-b border-line p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by Order ID" icon={ListFilter} />
          <h1 className="font-semibold text-primary">Track Ongoing Trip</h1>
        </div>
        <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
          {ongoingOrders.isPending ? (
            <>
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </>
          ) : ongoingOrders.isError ? (
            <ErrorState error={ongoingOrders.error} onRetry={ongoingOrders.refetch} />
          ) : orders.length === 0 ? (
            <EmptyState icon={Package} title={search ? 'No matching trips' : 'No ongoing trips'} description={search ? 'Try a different Order ID.' : 'Trips in progress will appear here.'} />
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} active={order.id === focusedId} onSelect={setFocusedId} />
            ))
          )}
        </div>
      </Card>

      <Card className="relative min-h-[400px] flex-1 overflow-hidden">
        <TripMap trips={orders} focusedId={focusedId} onSelectTrip={setFocusedId} />
        {focused && <TripDetails order={focused} onClose={() => setFocusedId(null)} />}
      </Card>
    </div>
  )
}

function TripDetails({ order, onClose }) {
  return (
    <div className="absolute left-3 right-3 top-3 rounded-2xl border border-line bg-white/95 p-4 shadow-sm sm:right-auto sm:w-80">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400">Tracking</p>
          <p className="font-semibold text-primary">#{order.id}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Stop tracking" className="rounded-lg p-1 text-slate-400 hover:bg-page">
          <X size={16} />
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt className="text-xs text-slate-400">Rider</dt><dd className="truncate">{order.riderName}</dd></div>
        <div><dt className="text-xs text-slate-400">Vehicle</dt><dd>{order.vehicleBikeId}</dd></div>
        <div><dt className="text-xs text-slate-400">Amount</dt><dd>{formatCurrency(order.amount)}</dd></div>
        <div><dt className="text-xs text-slate-400">Fleet owner</dt><dd className="truncate">{order.fleetOwnerName}</dd></div>
      </dl>
    </div>
  )
}
