import { Bike } from 'lucide-react'
import StatusPill from '../ui/StatusPill'
import RowActionsMenu from './RowActionsMenu'

// Shared by the Dashboard ("Active Vehicles") and Fleet Management.
// `showFleetOwner` adds the admin-only "Fleet Owner" column. The DATA is
// already scoped by the server; this prop only decides what to display.
export default function VehicleTable({ vehicles, showFleetOwner = false }) {
  const headers = [
    'Photo', 'Bike ID', 'Bike Name', 'Manufacturer', 'License No.', 'GPS Tracker SN',
    'Status', 'Assigned Rider', ...(showFleetOwner ? ['Fleet Owner'] : []),
  ]

  return (
    // `relative` keeps the absolutely-positioned sr-only header inside this
    // scroll box; without it, it escapes and widens the whole page.
    <div className="thin-scroll relative overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-slate-400">
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
            ))}
            <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-page/60">
              <td className="px-5 py-3">
                {v.photo ? (
                  <img src={v.photo} alt="" className="size-10 rounded-lg object-cover" />
                ) : (
                  <span className="size-10 rounded-lg bg-badge-blue text-badge-blue-fg grid place-items-center">
                    <Bike size={18} />
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-medium text-primary">{v.bikeId}</td>
              <td className="whitespace-nowrap px-5 py-3">{v.name}</td>
              <td className="whitespace-nowrap px-5 py-3">{v.manufacturer}</td>
              <td className="whitespace-nowrap px-5 py-3">{v.licenseNo}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">{v.gpsSerial}</td>
              <td className="px-5 py-3"><StatusPill status={v.status} /></td>
              <td className="whitespace-nowrap px-5 py-3">
                {v.assignedRiderName ?? <span className="text-slate-400">Unassigned</span>}
              </td>
              {showFleetOwner && <td className="whitespace-nowrap px-5 py-3">{v.fleetOwnerName}</td>}
              <td className="px-5 py-3 text-right">
                <RowActionsMenu label={`Actions for ${v.bikeId}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
