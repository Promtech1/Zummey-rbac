// Shown when a list has nothing in it yet (not when it's loading or errored).
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span className="size-16 rounded-full bg-badge-orange text-badge-orange-fg grid place-items-center">
          <Icon size={30} />
        </span>
      )}
      <p className="mt-4 text-lg font-semibold text-primary">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
