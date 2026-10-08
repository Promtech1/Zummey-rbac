import { Search, X } from 'lucide-react'

// Row of list filters that sits above a table.
export function Toolbar({ children }) {
  return <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">{children}</div>
}

export function SearchInput({ value, onChange, placeholder = 'Search', icon: Icon = Search, className = '' }) {
  return (
    <label className={`flex min-w-0 items-center gap-2 rounded-full border border-line bg-page px-4 py-2 focus-within:border-primary ${className}`}>
      <Icon size={16} className="shrink-0 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="text-slate-400 hover:text-slate-600">
          <X size={15} />
        </button>
      )}
    </label>
  )
}

export function FilterSelect({ value, onChange, label, children }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-line bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-primary"
    >
      {children}
    </select>
  )
}
