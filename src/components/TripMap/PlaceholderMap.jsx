import { useId } from 'react'
import { Car } from 'lucide-react'
import { pointAlong, project, routePoints, tripProgress, viewBoxAround } from './geometry'

// Hand-drawn stand-in for a real map: grey "city" with faint streets, a blue
// route per trip, pickup/destination dots and a car marker. No API key needed.

const CENTER = { lat: 6.3355, lng: 5.6206 } // King's Square / Ring Road

const ROADS = [
  { name: 'Airport Rd', points: [CENTER, { lat: 6.317, lng: 5.6 }, { lat: 6.302, lng: 5.584 }] },
  { name: 'New Lagos Rd', points: [CENTER, { lat: 6.32, lng: 5.632 }, { lat: 6.297, lng: 5.641 }] },
  { name: 'Ekenwan Rd', points: [CENTER, { lat: 6.338, lng: 5.6 }, { lat: 6.346, lng: 5.583 }] },
  { name: 'Sapele Rd', points: [CENTER, { lat: 6.312, lng: 5.646 }] },
  { name: 'Akpakpava Rd', points: [CENTER, { lat: 6.352, lng: 5.646 }] },
  { name: 'Uselu Rd', points: [CENTER, { lat: 6.355, lng: 5.607 }] },
  { name: null, points: [{ lat: 6.322, lng: 5.586 }, { lat: 6.322, lng: 5.646 }] },
  { name: null, points: [{ lat: 6.3, lng: 5.612 }, { lat: 6.354, lng: 5.612 }] },
]

const PARKS = [
  { lat: 6.319, lng: 5.611, w: 70, h: 45 }, // GRA
  { lat: 6.343, lng: 5.632, w: 55, h: 40 },
]

const toPath = (points) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')

export default function PlaceholderMap({ trips = [], focusedId = null, onSelectTrip, variant = 'full' }) {
  const patternId = useId()
  const isThumbnail = variant === 'thumbnail'
  const focused = trips.find((t) => t.id === focusedId)

  // Frame the focused trip, or every trip if none is focused.
  const framed = focused ? [focused] : trips
  const vb = viewBoxAround(framed.flatMap(routePoints), isThumbnail ? 0.25 : 0.35)
  const k = vb.w / 1000 // keeps markers the same on-screen size at any zoom
  const center = project(CENTER)

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid slice"
      className="block size-full"
      role="img"
      aria-label={focused ? `Map of trip ${focused.id}` : `Map of ${trips.length} ongoing trips`}
    >
      <defs>
        <pattern id={patternId} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" fill="none" stroke="#e3e6eb" strokeWidth="1.5" />
        </pattern>
      </defs>

      {/* city background + faint street grid */}
      <rect x="-1000" y="-1000" width="3000" height="2800" fill="#eef0f3" />
      <rect x="-1000" y="-1000" width="3000" height="2800" fill={`url(#${patternId})`} />
      {PARKS.map((park, i) => {
        const p = project(park)
        return <rect key={i} x={p.x - park.w / 2} y={p.y - park.h / 2} width={park.w} height={park.h} rx="12" fill="#dcefe0" />
      })}

      {/* main roads */}
      <circle cx={center.x} cy={center.y} r="55" fill="none" stroke="#ffffff" strokeWidth="12" />
      {ROADS.map((road, i) => (
        <path key={i} d={toPath(road.points.map(project))} fill="none" stroke="#ffffff" strokeWidth={road.name ? 12 : 8} strokeLinecap="round" />
      ))}
      {!isThumbnail &&
        ROADS.filter((r) => r.name).map((road) => {
          const p = project(road.points[1])
          return (
            <text key={road.name} x={p.x} y={p.y - 10 * k} fontSize={13 * k} fill="#9aa3b2" textAnchor="middle" fontFamily="Poppins, sans-serif">
              {road.name}
            </text>
          )
        })}

      {/* trip routes: faded when another trip is focused */}
      {trips.map((trip) => {
        const points = routePoints(trip)
        const dimmed = focused && trip.id !== focused.id
        return (
          <path
            key={trip.id}
            d={toPath(points)}
            fill="none"
            stroke={dimmed ? '#c7d2fe' : '#2563eb'}
            strokeWidth={(dimmed ? 3 : 5) * k}
            strokeLinejoin="round"
            strokeLinecap="round"
            onClick={onSelectTrip ? () => onSelectTrip(trip.id) : undefined}
            className={onSelectTrip ? 'cursor-pointer' : undefined}
          />
        )
      })}

      {/* pickup (orange) and destination (blue) dots, then car markers on top */}
      {trips.map((trip) => {
        const points = routePoints(trip)
        const dimmed = focused && trip.id !== focused.id
        const start = points[0]
        const end = points[points.length - 1]
        const car = pointAlong(points, tripProgress(trip))
        const r = (isThumbnail ? 9 : 7) * k
        return (
          <g key={trip.id} opacity={dimmed ? 0.45 : 1}>
            <circle cx={start.x} cy={start.y} r={r} fill="#f97316" stroke="#fff" strokeWidth={2.5 * k} />
            <circle cx={end.x} cy={end.y} r={r} fill="#2563eb" stroke="#fff" strokeWidth={2.5 * k} />
            {trip.status === 'ongoing' && (
              <g
                onClick={onSelectTrip ? () => onSelectTrip(trip.id) : undefined}
                className={onSelectTrip ? 'cursor-pointer' : undefined}
              >
                <circle cx={car.x} cy={car.y} r={(isThumbnail ? 20 : 16) * k} fill="#1e2a5e" stroke="#fff" strokeWidth={3 * k} />
                <Car
                  x={car.x - (isThumbnail ? 12 : 10) * k}
                  y={car.y - (isThumbnail ? 12 : 10) * k}
                  size={(isThumbnail ? 24 : 20) * k}
                  color="#ffffff"
                  strokeWidth={2.2}
                />
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
