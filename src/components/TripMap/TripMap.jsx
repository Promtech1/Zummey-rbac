import PlaceholderMap from './PlaceholderMap'

// The ONE map component pages use. Pages never know which map is behind it.
//
// Props contract (any map implementation must accept these):
//   trips         orders with { id, status, pickup{lat,lng}, destination{lat,lng}, currentLocation }
//   focusedId     id of the trip to zoom to, or null to show all
//   onSelectTrip  (id) => void, called when a route or car marker is clicked
//   variant       'full' | 'thumbnail'
//
// To use Google Maps later:
//   1. Put the key in .env:  VITE_GOOGLE_MAPS_KEY=...
//   2. Build GoogleTripMap.jsx in this folder with the same props
//      (ask before adding a Google Maps library).
//   3. Add it to MAP_COMPONENTS below. Nothing else in the app changes.
const MAPS_PROVIDER = import.meta.env.VITE_GOOGLE_MAPS_KEY ? 'google' : 'placeholder'

const MAP_COMPONENTS = {
  placeholder: PlaceholderMap,
  // google: GoogleTripMap,
}

export default function TripMap({ className = '', ...props }) {
  const MapComponent = MAP_COMPONENTS[MAPS_PROVIDER] ?? PlaceholderMap
  const isFull = props.variant !== 'thumbnail'

  return (
    <div className={`relative size-full overflow-hidden bg-[#eef0f3] ${className}`}>
      <MapComponent {...props} />
      {isFull && (
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-accent" /> Pickup</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-600" /> Destination</span>
          <span className="text-slate-400">Map preview</span>
        </div>
      )}
    </div>
  )
}
