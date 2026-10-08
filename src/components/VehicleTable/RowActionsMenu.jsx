import { useEffect, useRef, useState } from 'react'
import { Eye, MoreHorizontal, Pencil, UserPlus } from 'lucide-react'

// The "..." menu on a table row. Actions are placeholders for now; pass
// `actions` ([{ label, icon }]) to change them (defaults are vehicle actions).
// The menu uses fixed positioning so the table's horizontal scroll
// container can't clip it.
const VEHICLE_ACTIONS = [
  { label: 'View details', icon: Eye },
  { label: 'Assign rider', icon: UserPlus },
  { label: 'Edit vehicle', icon: Pencil },
]

export default function RowActionsMenu({ label, actions = VEHICLE_ACTIONS }) {
  const [position, setPosition] = useState(null) // null = closed
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!position) return
    function close(event) {
      if (event.type === 'mousedown' && (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target))) return
      setPosition(null)
    }
    document.addEventListener('mousedown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [position])

  function toggle() {
    if (position) return setPosition(null)
    const rect = buttonRef.current.getBoundingClientRect()
    setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={Boolean(position)}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-page hover:text-primary"
      >
        <MoreHorizontal size={18} />
      </button>
      {position && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: position.top, right: position.right }}
          className="fixed z-40 w-44 rounded-xl border border-line bg-white p-1 text-left shadow-lg"
        >
          {actions.map(({ label: actionLabel, icon: Icon }) => (
            <button
              key={actionLabel}
              type="button"
              role="menuitem"
              disabled
              title="Coming soon"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400"
            >
              <Icon size={15} /> {actionLabel}
              <span className="ml-auto text-[10px] uppercase">soon</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
