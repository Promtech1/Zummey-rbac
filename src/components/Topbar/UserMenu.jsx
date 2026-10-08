import { useEffect, useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLE_LABELS } from '../../auth/roles'

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Circular avatar that opens a small menu with the user's details and Log out.
export default function UserMenu() {
  const { user, role, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close when clicking anywhere outside the menu.
  useEffect(() => {
    if (!open) return
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="size-10 rounded-full overflow-hidden bg-primary text-white text-sm font-semibold grid place-items-center ring-2 ring-white hover:ring-accent-soft"
      >
        {user.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : initials(user.name)}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-60 rounded-2xl border border-line bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="font-medium text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="mt-2 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-page hover:text-primary"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
