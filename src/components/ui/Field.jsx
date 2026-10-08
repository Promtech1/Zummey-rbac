// Labelled form controls with consistent styling.
const controlClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

export function TextField({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className={controlClass} />
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function SelectField({ label, hint, children, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select {...props} className={controlClass}>
        {children}
      </select>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

// Inline error banner for forms (mutation errors).
export function FormError({ error }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {error.message}
    </p>
  )
}
