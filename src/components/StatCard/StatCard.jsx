import { Skeleton } from '../ui/Skeleton'

const TONES = {
  orange: 'bg-badge-orange text-badge-orange-fg',
  purple: 'bg-badge-purple text-badge-purple-fg',
  blue: 'bg-badge-blue text-badge-blue-fg',
}

export default function StatCard({ label, value, icon: Icon, tone = 'orange', loading = false, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
      <span className={`size-12 shrink-0 rounded-xl grid place-items-center ${TONES[tone]}`}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        {loading ? (
          <Skeleton className="mt-1.5 h-7 w-20" />
        ) : (
          <p className="truncate font-semibold text-primary text-[clamp(1.25rem,1vw+1rem,1.75rem)]">{value}</p>
        )}
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}
