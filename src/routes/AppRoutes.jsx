import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES, WEB_ROLES } from '../auth/roles'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import FleetManagement from '../pages/FleetManagement/FleetManagement'
import Riders from '../pages/Riders/Riders'
import TrackOrders from '../pages/Orders/TrackOrders'
import OrderList from '../pages/Orders/OrderList'
import Notifications from '../pages/Notifications/Notifications'
import Settings from '../pages/Settings/Settings'
import HelpSupport from '../pages/HelpSupport/HelpSupport'
import Unauthorized from '../pages/Unauthorized'
import FleetOwners from '../pages/admin/FleetOwners'
import PendingUsers from '../pages/admin/PendingUsers'
import { PageSkeleton } from '../components/ui/Skeleton'

// Finance is the only page using Recharts (a large library), so it's loaded
// on demand: its code downloads the first time someone opens /finance.
const Finance = lazy(() => import('../pages/Finance/Finance'))

// How to read this tree:
//   ProtectedRoute  -> must be logged in
//     DashboardLayout -> sidebar + topbar around every page
//       RoleRoute(WEB_ROLES)   -> shared pages (admin + fleet manager)
//       RoleRoute([ADMIN])     -> admin-only pages
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<RoleRoute allowedRoles={WEB_ROLES} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fleet-management" element={<FleetManagement />} />
            <Route path="/riders" element={<Riders />} />
            <Route path="/orders/track" element={<TrackOrders />} />
            <Route path="/orders/list" element={<OrderList />} />
            <Route
              path="/finance"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Finance />
                </Suspense>
              }
            />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/profile" element={<Settings />} />
            <Route path="/help" element={<HelpSupport />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/fleet-owners" element={<FleetOwners />} />
            <Route path="/admin/pending-users" element={<PendingUsers />} />
            <Route path="/settings/roles" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
