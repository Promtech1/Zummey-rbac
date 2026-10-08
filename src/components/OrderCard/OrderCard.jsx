import { Link } from 'react-router-dom'
import { formatDateTime } from '../../utils/formatDate'
import TripMap from '../TripMap/TripMap'
import { Skeleton } from '../ui/Skeleton'

// One ongoing order: ID, time, pickup -> destination, a map thumbnail, and
// "View Details". Clicking the card calls onSelect (e.g. focus it on the map).
export default function OrderCard({ order, active = false, onSelect }) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(order.id)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={() => onSelect?.(order.id)}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer rounded-2xl border bg-white p-4 outline-none transition focus-visible:ring-2 focus-visible:ring-primary/20 ${
        active ? 'border-accent ring-1 ring-accent/30' : 'border-line hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">Order ID</p>
          <p className="font-semibold text-primary">#{order.id}</p>
        </div>
        <p className="whitespace-nowrap text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
      </div>

      <div className="mt-3 flex gap-3">
        <ol className="min-w-0 flex-1 space-y-3">
          <li className="relative flex gap-2.5">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-accent ring-4 ring-accent-soft" />
            {/* vertical line joining the two dots */}
            <span className="absolute left-[4.5px] top-4 h-[calc(100%+0.25rem)] w-px bg-slate-200" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Pickup</p>
              <p className="truncate text-sm text-slate-700">{order.pickup.address}</p>
            </div>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-badge-blue" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Destination</p>
              <p className="truncate text-sm text-slate-700">{order.destination.address}</p>
            </div>
          </li>
        </ol>
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-line">
          <TripMap variant="thumbnail" trips={[order]} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="truncate text-slate-500">{order.riderName}</span>
        <Link
          to={`/orders/track?order=${order.id}`}
          onClick={(e) => e.stopPropagation()}
          className="whitespace-nowrap font-medium text-accent hover:underline"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-line p-4">
      <Skeleton className="h-4 w-28" />
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <Skeleton className="h-20 w-24" />
      </div>
    </div>
  )
}
