import { Outlet } from 'react-router-dom'
import { Bike, MapPinned, ShieldCheck, Wallet } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Bike, text: 'Track every vehicle and rider in your fleet' },
  { icon: MapPinned, text: 'Follow ongoing deliveries live on the map' },
  { icon: Wallet, text: 'See earnings and withdraw in Naira' },
  { icon: ShieldCheck, text: 'Role-based access for admins and fleet owners' },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-page lg:bg-white">
      <aside className="hidden lg:flex flex-col justify-between bg-primary text-white p-12">
        <div className="flex items-center gap-2">
          <span className="size-9 rounded-xl bg-accent grid place-items-center">
            <Bike size={20} />
          </span>
          <span className="text-xl font-semibold">Zummey</span>
        </div>

        <div>
          <h2 className="font-semibold leading-tight text-[clamp(1.75rem,2.2vw+0.5rem,2.5rem)]">
            Manage your fleet, riders and deliveries in one place.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <span className="size-8 rounded-lg bg-white/10 grid place-items-center">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/50">Benin City, Edo State</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
