// One place that maps every status value in the app to a label and colour.
const STATUSES = {
  // vehicles
  active: { label: 'Online', className: 'bg-green-50 text-green-700' },
  inactive: { label: 'Offline', className: 'bg-slate-100 text-slate-600' },
  maintenance: { label: 'Maintenance', className: 'bg-amber-50 text-amber-700' },
  // orders
  ongoing: { label: 'Ongoing', className: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700' },
  // transactions
  successful: { label: 'Successful', className: 'bg-green-50 text-green-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700' },
  // accounts
  suspended: { label: 'Suspended', className: 'bg-red-50 text-red-700' },
}

// People (riders, fleet owners) use "active" too, but "Online" reads oddly for a person.
const PERSON_LABELS = { active: 'Active', inactive: 'Inactive' }

export default function StatusPill({ status, kind }) {
  const config = STATUSES[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  const label = kind === 'person' ? (PERSON_LABELS[status] ?? config.label) : config.label
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
