// Turns lat/lng into SVG coordinates for the placeholder map, and builds
// simple street-like routes. A real map provider does all of this for you.

// The patch of Benin City the placeholder map shows.
const BOUNDS = { minLat: 6.295, maxLat: 6.355, minLng: 5.582, maxLng: 5.648 }
const MAP_WIDTH = 1000
const MAP_HEIGHT = 800

export function project({ lat, lng }) {
  return {
    x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * MAP_WIDTH,
    y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * MAP_HEIGHT,
  }
}

const distance = (p, q) => Math.hypot(q.x - p.x, q.y - p.y)

// Street-like route: head along one axis, jog across, then finish along the other.
export function routePoints(trip) {
  const start = project(trip.pickup)
  const end = project(trip.destination)
  const midY = (start.y + end.y) / 2
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end]
}

// The point `fraction` (0..1) of the way along a polyline.
export function pointAlong(points, fraction) {
  const lengths = points.slice(1).map((p, i) => distance(points[i], p))
  let remaining = lengths.reduce((sum, l) => sum + l, 0) * fraction
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] ? remaining / lengths[i] : 0
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t,
      }
    }
    remaining -= lengths[i]
  }
  return points[points.length - 1]
}

// How far along its trip a vehicle is (0..1), from its current GPS position.
export function tripProgress(trip) {
  if (!trip.currentLocation) return trip.status === 'completed' ? 1 : 0
  const start = project(trip.pickup)
  const end = project(trip.destination)
  const total = distance(start, end)
  return total ? Math.min(1, distance(start, project(trip.currentLocation)) / total) : 0
}

// A viewBox that frames `points` with padding, keeping the map's aspect ratio.
export function viewBoxAround(points, padding = 0.35) {
  if (!points.length) return { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const aspect = MAP_WIDTH / MAP_HEIGHT
  let w = Math.max(Math.max(...xs) - Math.min(...xs), 120) * (1 + padding * 2)
  let h = Math.max(Math.max(...ys) - Math.min(...ys), 120) * (1 + padding * 2)
  if (w / h > aspect) h = w / aspect
  else w = h * aspect
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}
