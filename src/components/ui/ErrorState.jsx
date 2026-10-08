import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react'

// Shows an API error. A 403 gets its own message, because "you're not allowed"
// is a different situation from "something broke, try again".
export default function ErrorState({ error, onRetry, className = '' }) {
  const forbidden = error?.status === 403
  const Icon = forbidden ? ShieldAlert : AlertTriangle

  return (
    <div role="alert" className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <span
        className={`size-12 rounded-full grid place-items-center ${
          forbidden ? 'bg-badge-purple text-badge-purple-fg' : 'bg-red-50 text-red-600'
        }`}
      >
        <Icon size={22} />
      </span>
      <p className="mt-4 font-semibold text-primary">
        {forbidden ? "You don't have access to this" : "Couldn't load this data"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {forbidden
          ? 'The server refused the request (403 Forbidden). Ask an admin if you think you should have access.'
          : error?.message}
      </p>
      {!forbidden && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-primary hover:bg-page"
        >
          <RotateCcw size={15} /> Try again
        </button>
      )}
    </div>
  )
}
