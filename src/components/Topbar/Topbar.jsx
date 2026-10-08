import { Link, useLocation } from 'react-router-dom'
import { Bell, Bike, PanelLeftClose, PanelLeftOpen, Search, Settings } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import UserMenu from './UserMenu'

export default function Topbar({ collapsed, onToggleSidebar }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const firstName = user.name.split(' ')[0]
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <header className="h-[72px] shrink-0 bg-white border-b border-line flex items-center">
      {/* Logo area lines up with the sidebar below it */}
      <div
        className={`h-full shrink-0 flex items-center gap-2 border-r border-line transition-[width] duration-200 ${
          collapsed ? 'w-[76px] justify-center' : 'w-64 justify-between px-5'
        }`}
      >
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="size-8 rounded-lg bg-accent text-white grid place-items-center">
              <Bike size={18} />
            </span>
            <span className="text-lg font-semibold text-primary">Zummey</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="size-9 rounded-lg grid place-items-center text-slate-500 hover:bg-page hover:text-primary"
        >
          <ToggleIcon size={20} />
        </button>
      </div>

      <div className="flex-1 min-w-0 h-full flex items-center gap-3 px-[clamp(0.75rem,2vw,1.75rem)]">
        {pathname === '/dashboard' && (
          <h1 className="truncate font-semibold text-primary text-[clamp(1rem,0.8vw+0.8rem,1.375rem)]">
            Hello {firstName}!
          </h1>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Visual only for now: global search isn't wired to anything yet. */}
          <label className="hidden md:flex items-center gap-2 rounded-full border border-line bg-page px-4 py-2 w-[clamp(12rem,22vw,20rem)] focus-within:border-primary">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="search"
              placeholder="Search here..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>

          <Link to="/settings" aria-label="Settings" className="size-10 rounded-full grid place-items-center text-slate-500 hover:bg-page hover:text-primary">
            <Settings size={20} />
          </Link>

          <Link to="/notifications" aria-label="Notifications" className="relative size-10 rounded-full grid place-items-center text-slate-500 hover:bg-page hover:text-primary">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-accent ring-2 ring-white" />
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
