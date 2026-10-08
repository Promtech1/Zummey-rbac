import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-line bg-white text-primary hover:bg-page',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
}

export default function Button({ variant = 'primary', loading = false, icon: Icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
