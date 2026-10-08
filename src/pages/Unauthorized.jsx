import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { ROLE_LABELS } from '../auth/roles'
import Card from '../components/ui/Card'

// Where RoleRoute sends people whose role isn't allowed on a page.
export default function Unauthorized() {
  const { role } = useAuth()

  return (
    <Card className="mx-auto mt-[clamp(1rem,6vh,4rem)] flex max-w-lg flex-col items-center px-6 py-14 text-center">
      <span className="size-16 rounded-full bg-badge-purple text-badge-purple-fg grid place-items-center">
        <ShieldX size={30} />
      </span>
      <h1 className="mt-5 font-semibold text-primary text-[clamp(1.25rem,1vw+1rem,1.625rem)]">
        You don't have access to this page
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Your role ({ROLE_LABELS[role] ?? role}) isn't allowed to view it. If you think this is a mistake, ask an admin.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Back to dashboard
      </Link>
    </Card>
  )
}
