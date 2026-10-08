import {
  Bell,
  Bike,
  ChartColumn,
  CircleHelp,
  LayoutDashboard,
  Package,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import { ROLES, WEB_ROLES } from '../../auth/roles'

const { ADMIN, FLEET_MANAGER } = ROLES

// ONE menu for every role. Each item says which roles may see it; the
// Sidebar keeps only the items whose `roles` include the current role.
// To add a page for a role, add an entry here (and a route in AppRoutes).
//
// Item shape: { id, label, icon?, path | children, roles }
// Children carry their own `roles` too, so a group could show different
// children to different roles.

export const MAIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: WEB_ROLES },
  { id: 'fleet', label: 'Fleet Management', icon: Bike, path: '/fleet-management', roles: WEB_ROLES },

  // Same page (/riders) reached two ways: a single link for fleet managers,
  // and inside "User Management" for admins.
  { id: 'riders', label: 'Riders Management', icon: Users, path: '/riders', roles: [FLEET_MANAGER] },
  {
    id: 'users',
    label: 'User Management',
    icon: UserCog,
    roles: [ADMIN],
    children: [
      { id: 'users-riders', label: 'Riders', path: '/riders', roles: [ADMIN] },
      { id: 'users-owners', label: 'Fleet Owners', path: '/admin/fleet-owners', roles: [ADMIN] },
      { id: 'users-pending', label: 'Pending Users', path: '/admin/pending-users', roles: [ADMIN] },
    ],
  },

  {
    id: 'orders',
    label: 'Order Management',
    icon: Package,
    roles: WEB_ROLES,
    children: [
      { id: 'orders-track', label: 'Track Orders', path: '/orders/track', roles: WEB_ROLES },
      { id: 'orders-list', label: 'Order List', path: '/orders/list', roles: WEB_ROLES },
    ],
  },
  { id: 'finance', label: 'Finance & Reports', icon: ChartColumn, path: '/finance', roles: WEB_ROLES },
]

export const BOTTOM_MENU = [
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', roles: WEB_ROLES },

  // Two "Settings" entries: a plain link for fleet managers, an expandable
  // group for admins.
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: [FLEET_MANAGER] },
  {
    id: 'settings-admin',
    label: 'Settings',
    icon: Settings,
    roles: [ADMIN],
    children: [
      { id: 'settings-profile', label: 'Profile', path: '/settings/profile', roles: [ADMIN] },
      { id: 'settings-roles', label: 'Roles & Permissions', path: '/settings/roles', roles: [ADMIN] },
    ],
  },

  { id: 'help', label: 'Help & Support', icon: CircleHelp, path: '/help', roles: WEB_ROLES },
]
