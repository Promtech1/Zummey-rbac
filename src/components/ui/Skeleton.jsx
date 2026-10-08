// Grey pulsing placeholders shown while data loads.
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />
}

// Whole-page placeholder (title, stat cards, a big panel). Used as the
// Suspense fallback while a lazy-loaded page's code downloads.
export function PageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading page">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[86px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-2xl" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="divide-y divide-line" aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className={`h-4 ${col === 0 ? 'w-10' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
