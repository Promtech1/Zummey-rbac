import { useState } from 'react'
import { NavLink, matchPath, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'

const baseClass = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition'
const idleClass = 'text-slate-500 hover:bg-page hover:text-primary'
const activeClass = 'bg-accent-soft text-accent'

export default function SidebarItem({ item, collapsed, onExpandSidebar }) {
  if (item.children) {
    return <SidebarGroup item={item} collapsed={collapsed} onExpandSidebar={onExpandSidebar} />
  }

  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `${baseClass} ${isActive ? activeClass : idleClass} ${collapsed ? 'justify-center' : ''}`
      }
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

// A parent item with children: click to expand/collapse. It opens by itself
// when the current URL belongs to one of its children.
function SidebarGroup({ item, collapsed, onExpandSidebar }) {
  const { pathname } = useLocation()
  const hasActiveChild = item.children.some((child) => matchPath({ path: child.path, end: false }, pathname))
  const [open, setOpen] = useState(hasActiveChild)

  // When the URL changes to one of our children, auto-expand. (Updating state
  // during render when an input changes is React's recommended alternative
  // to a useEffect here.) You can still collapse it by clicking afterwards.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    if (hasActiveChild) setOpen(true)
  }

  function handleClick() {
    // In icons-only mode there's no room for children: widen the sidebar first.
    if (collapsed) {
      onExpandSidebar()
      setOpen(true)
    } else {
      setOpen((isOpen) => !isOpen)
    }
  }

  const Icon = item.icon
  const Chevron = open ? ChevronDown : ChevronRight
  // Children are hidden when collapsed, so the parent icon shows the active state instead.
  const stateClass = hasActiveChild ? (collapsed ? activeClass : 'text-primary') : idleClass

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open && !collapsed}
        title={collapsed ? item.label : undefined}
        className={`${baseClass} ${stateClass} ${collapsed ? 'justify-center' : ''}`}
      >
        <Icon size={20} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <Chevron size={16} className="shrink-0" />
          </>
        )}
      </button>

      {open && !collapsed && (
        <ul className="mt-1 ml-[22px] border-l border-line pl-4 space-y-0.5">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  `block rounded-lg px-2 py-2 text-sm transition ${
                    isActive ? 'text-accent font-medium' : 'text-slate-500 hover:text-primary'
                  }`
                }
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
