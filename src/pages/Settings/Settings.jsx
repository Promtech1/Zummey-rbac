import { useLocation } from 'react-router-dom'
import ComingSoon from '../../components/ui/ComingSoon'

// One placeholder for /settings and the admin sub-pages
// (/settings/profile, /settings/roles).
const SECTIONS = {
  '/settings/profile': 'Profile',
  '/settings/roles': 'Roles & Permissions',
}

export default function Settings() {
  const { pathname } = useLocation()
  const section = SECTIONS[pathname]
  return (
    <ComingSoon
      title={section ? `Settings · ${section}` : 'Settings'}
      description="Manage your account, preferences and team access here."
    />
  )
}
