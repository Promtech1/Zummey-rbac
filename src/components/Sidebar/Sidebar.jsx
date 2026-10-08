import { useAuth } from '../../auth/useAuth'
import { BOTTOM_MENU, MAIN_MENU } from './menuConfig'
import SidebarItem from './SidebarItem'

// Role-based menu filtering.
//
// We keep one menu config and hide what the current role can't use, rather
// than maintaining a separate sidebar per role. This is a convenience so
// people only see links that work for them. It is NOT security: a hidden
// link's URL can still be typed in (RoleRoute handles that) and its API can
// still be called (the server's 403 handles that).
function filterByRole(items, role) {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => (item.children ? { ...item, children: filterByRole(item.children, role) } : item))
}

export default function Sidebar({ collapsed, onExpand }) {
  const { role } = useAuth()
  const mainItems = filterByRole(MAIN_MENU, role)
  const bottomItems = filterByRole(BOTTOM_MENU, role)

  return (
    <aside
      className={`shrink-0 bg-white border-r border-line flex flex-col transition-[width] duration-200 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <nav aria-label="Main" className="flex-1 overflow-y-auto thin-scroll px-3 py-5 space-y-1">
        {mainItems.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} onExpandSidebar={onExpand} />
        ))}
      </nav>

      <div className="mx-4 border-t border-line" />

      <nav aria-label="Account" className="px-3 py-4 space-y-1">
        {bottomItems.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} onExpandSidebar={onExpand} />
        ))}
      </nav>
    </aside>
  )
}
