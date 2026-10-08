import { useEffect } from 'react'
import { X } from 'lucide-react'

// A centred dialog over a dimmed backdrop. Closes on Escape or backdrop click.
// Pass `onSubmit` to make the whole dialog a <form>, so a type="submit" button
// in the footer (or pressing Enter) submits it.
export default function Modal({ title, subtitle, onClose, children, footer, onSubmit }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const Container = onSubmit ? 'form' : 'div'

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onMouseDown={onClose}>
      <Container
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={
          onSubmit &&
          ((e) => {
            e.preventDefault()
            onSubmit()
          })
        }
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-page hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="thin-scroll space-y-4 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </Container>
    </div>
  )
}
