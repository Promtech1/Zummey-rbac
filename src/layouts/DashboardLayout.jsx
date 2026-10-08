import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Topbar from '../components/Topbar/Topbar'
import RoleSwitcher from '../components/dev/RoleSwitcher'
import { DEV_TOOLS_ENABLED } from '../services/request'

// The shell around every logged-in page: Topbar on top, Sidebar on the left,
// the current page (<Outlet/>) on the right.
export default function DashboardLayout() {
  // Start in icons-only mode on narrow screens so the content has room.
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)

  return (
    <div className="h-screen flex flex-col">
      <Topbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
        <main className="flex-1 min-w-0 overflow-y-auto p-[clamp(1rem,2vw,1.75rem)]">
          <Outlet />
        </main>
      </div>
      {DEV_TOOLS_ENABLED && <RoleSwitcher />}
    </div>
  )
}
