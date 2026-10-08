// In-memory "database" for the mock backend, persisted to localStorage so
// edits (new riders, approvals, withdrawals) survive a refresh.
//
// Every business record carries a fleetManagerId. That one column is what
// makes data scoping possible: mockServer.js filters on it.
//
// Seed plan:
//   fm_1 Nosa Osagie : 22 vehicles (13 active / 7 inactive / 2 maintenance), 12 riders, 9 orders
//   fm_2 Ada Okoro   : 15 vehicles ( 9 /  5 / 1), 8 riders, 6 orders
//   fm_3 Emeka Eze   : 10 vehicles ( 5 /  3 / 2), 0 riders (empty state), 0 orders
//   Admin sees all   : 47 vehicles (27 / 15 / 5), 20 riders, 15 orders
import { ROLES } from '../auth/roles'

const STORAGE_KEY = 'zummey_mock_db_v1'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const pad = (n, length = 3) => String(n).padStart(length, '0')
const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ'

// Real neighbourhoods in Benin City, Edo State (approximate coordinates).
const PLACES = [
  { address: '14 Ihama Road, GRA, Benin City', lat: 6.3185, lng: 5.6128 },
  { address: '45 Airport Road, Benin City', lat: 6.3231, lng: 5.6011 },
  { address: '22 New Lagos Road, Benin City', lat: 6.324, lng: 5.6302 },
  { address: '9 Ekenwan Road, Benin City', lat: 6.333, lng: 5.6085 },
  { address: '3 Dawson Road, GRA, Benin City', lat: 6.3152, lng: 5.617 },
  { address: '120 Airport Road, Benin City', lat: 6.3122, lng: 5.5978 },
  { address: '87 New Lagos Road, Benin City', lat: 6.3105, lng: 5.6325 },
  { address: '61 Ekenwan Road, Benin City', lat: 6.3392, lng: 5.596 },
]

const BIKE_MODELS = [
  { name: 'Boxer BM150', manufacturer: 'Bajaj' },
  { name: 'HLX 125', manufacturer: 'TVS' },
  { name: 'Apache RTR 160', manufacturer: 'TVS' },
  { name: 'CG 125', manufacturer: 'Honda' },
  { name: 'HJ150-10', manufacturer: 'Haojue' },
  { name: 'X-Ranger 200', manufacturer: 'Qlink' },
]

const FLEET_PLAN = [
  { fleetManagerId: 'fm_1', active: 13, inactive: 7, maintenance: 2 },
  { fleetManagerId: 'fm_2', active: 9, inactive: 5, maintenance: 1 },
  { fleetManagerId: 'fm_3', active: 5, inactive: 3, maintenance: 2 },
]

// fm_3 is intentionally missing: Emeka is a new fleet owner with no riders.
const RIDER_NAMES = {
  fm_1: [
    'Osaro Ighodaro', 'Efe Okungbowa', 'Ikponmwosa Aimuan', 'Uyi Edokpolo',
    'Osagie Iyamu', 'Eghosa Obaseki', 'Nosakhare Idahosa', 'Imade Ogbeide',
    'Itohan Ehigie', 'Ehis Uwaifo', 'Omoruyi Enabulele', 'Ivie Amadasun',
  ],
  fm_2: [
    'Chinedu Nwosu', 'Tunde Bakare', 'Ifeanyi Obi', 'Musa Danjuma',
    'Kelechi Uche', 'Segun Adeyemi', 'Obinna Eke', 'Yusuf Bello',
  ],
}

const ORDER_PLAN = {
  fm_1: ['ongoing', 'ongoing', 'ongoing', 'ongoing', 'completed', 'completed', 'completed', 'completed', 'cancelled'],
  fm_2: ['ongoing', 'ongoing', 'ongoing', 'completed', 'completed', 'cancelled'],
}

// Monthly revenue baseline per fleet owner, shaped by WAVE over 10 months.
const REVENUE_PLAN = { fm_1: 1_850_000, fm_2: 1_120_000 }
const WAVE = [0.82, 0.9, 1.05, 0.97, 1.12, 1.2, 1.08, 1.25, 1.18, 1.1]

function buildSeed() {
  const now = Date.now()
  const ago = (ms) => new Date(now - ms).toISOString()

  // --- users (people who can log in) ---------------------------------------
  // Plain-text passwords only because this is a mock. A real backend stores
  // password hashes and never sends them to the client.
  const account = { password: 'password123', avatar: null, status: 'active' }
  const users = [
    { ...account, id: 'admin_1', name: 'Admin User', email: 'admin@zummey.com', role: ROLES.ADMIN, phone: '+234 803 000 0001', joinedAt: ago(400 * DAY) },
    { ...account, id: 'fm_1', name: 'Nosa Osagie', email: 'fleet1@zummey.com', role: ROLES.FLEET_MANAGER, phone: '+234 803 412 7781', joinedAt: ago(320 * DAY) },
    { ...account, id: 'fm_2', name: 'Ada Okoro', email: 'fleet2@zummey.com', role: ROLES.FLEET_MANAGER, phone: '+234 806 219 4430', joinedAt: ago(250 * DAY) },
    { ...account, id: 'fm_3', name: 'Emeka Eze', email: 'fleet3@zummey.com', role: ROLES.FLEET_MANAGER, phone: '+234 809 557 1203', joinedAt: ago(20 * DAY) },
  ]

  // --- vehicles --------------------------------------------------------------
  const vehicles = []
  let n = 0
  for (const plan of FLEET_PLAN) {
    const statuses = [
      ...Array(plan.active).fill('active'),
      ...Array(plan.inactive).fill('inactive'),
      ...Array(plan.maintenance).fill('maintenance'),
    ]
    for (const status of statuses) {
      n += 1
      const model = BIKE_MODELS[n % BIKE_MODELS.length]
      vehicles.push({
        id: `veh_${pad(n)}`,
        bikeId: `ZB-${pad(n)}`,
        name: model.name,
        manufacturer: model.manufacturer,
        licenseNo: `BEN-${pad(((n * 137) % 900) + 100)}-${LETTERS[n % LETTERS.length]}${LETTERS[(n * 5) % LETTERS.length]}`,
        gpsSerial: `GT06-${((n * 7919) % 900000) + 100000}`,
        status,
        photo: null,
        assignedRiderId: null,
        fleetManagerId: plan.fleetManagerId,
        createdAt: ago((200 - n * 3) * DAY),
      })
    }
  }

  // --- riders (all but the last two per fleet get an active vehicle) --------
  const riders = []
  n = 0
  for (const [fleetManagerId, names] of Object.entries(RIDER_NAMES)) {
    const activeVehicles = vehicles.filter(
      (v) => v.fleetManagerId === fleetManagerId && v.status === 'active',
    )
    names.forEach((name, i) => {
      n += 1
      const id = `rdr_${pad(n, 2)}`
      const vehicle = i < names.length - 2 ? activeVehicles[i] : null
      if (vehicle) vehicle.assignedRiderId = id
      riders.push({
        id,
        name,
        phone: `+234 80${n % 10} ${pad((n * 271) % 1000)} ${pad((n * 1543) % 10000, 4)}`,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        licenseNo: `EDO-DL-${pad((n * 4057) % 100000, 5)}`,
        status: vehicle ? 'active' : 'inactive',
        fleetManagerId,
        joinedAt: ago((150 - n * 4) * DAY),
      })
    })
  }

  // --- orders ----------------------------------------------------------------
  const orders = []
  n = 0
  for (const [fleetManagerId, statuses] of Object.entries(ORDER_PLAN)) {
    const ridersWithBikes = riders.filter(
      (r) => r.fleetManagerId === fleetManagerId && r.status === 'active',
    )
    statuses.forEach((status, i) => {
      n += 1
      const rider = ridersWithBikes[i % ridersWithBikes.length]
      const vehicle = vehicles.find((v) => v.assignedRiderId === rider.id)
      const pickup = PLACES[(n * 3) % PLACES.length]
      const destination = PLACES[(n * 3 + 3) % PLACES.length]
      const progress = 0.3 + (n % 4) * 0.15 // how far along an ongoing trip is
      const createdAt =
        status === 'ongoing' ? ago((i + 1) * 25 * MINUTE) : ago((i + 1) * DAY + n * HOUR)
      orders.push({
        id: `ZM-${10230 + n}`,
        fleetManagerId,
        riderId: rider.id,
        vehicleId: vehicle.id,
        status,
        pickup,
        destination,
        currentLocation:
          status === 'ongoing'
            ? {
                lat: pickup.lat + (destination.lat - pickup.lat) * progress,
                lng: pickup.lng + (destination.lng - pickup.lng) * progress,
              }
            : null,
        amount: 1500 + ((n * 850) % 5000),
        createdAt,
        updatedAt: createdAt,
      })
    })
  }

  // --- finance transactions --------------------------------------------------
  // Two earnings payouts per month plus a monthly withdrawal, last 10 months.
  const transactions = []
  n = 0
  const today = new Date(now)
  const addTxn = (txn) => {
    n += 1
    transactions.push({ id: `txn_${pad(n, 4)}`, reference: `ZMY${pad(n * 7307, 8)}`, ...txn })
  }
  for (const [fleetManagerId, base] of Object.entries(REVENUE_PLAN)) {
    for (let m = 9; m >= 0; m--) {
      const total = Math.round((base * WAVE[9 - m]) / 1000) * 1000
      const onDay = (day) => new Date(today.getFullYear(), today.getMonth() - m, day, 10)
      for (const [day, share] of [[3, 0.45], [17, 0.55]]) {
        const date = onDay(day)
        if (date.getTime() > now) continue // don't create future transactions
        addTxn({ fleetManagerId, type: 'credit', description: 'Delivery earnings payout', amount: Math.round(total * share), status: 'successful', date: date.toISOString() })
      }
      if (m > 0) {
        addTxn({
          fleetManagerId,
          type: 'debit',
          description: fleetManagerId === 'fm_1' ? 'Withdrawal to GTBank ****4521' : 'Withdrawal to Access Bank ****9087',
          amount: Math.round(total * 0.7),
          status: fleetManagerId === 'fm_2' && m === 3 ? 'failed' : 'successful',
          date: onDay(25).toISOString(),
        })
      }
    }
    addTxn({ fleetManagerId, type: 'debit', description: 'Withdrawal request', amount: Math.round(base * 0.3), status: 'pending', date: ago(1 * DAY) })
  }

  // --- pending sign-ups awaiting admin approval ------------------------------
  const pendingUsers = [
    { id: 'pend_1', name: 'Osas Igbinedion', email: 'osas.igbinedion@example.com', phone: '+234 802 331 9045', roleRequested: ROLES.FLEET_MANAGER, fleetManagerId: null, requestedAt: ago(2 * DAY) },
    { id: 'pend_2', name: 'Blessing Omoregie', email: 'blessing.omoregie@example.com', phone: '+234 813 870 2216', roleRequested: ROLES.RIDER, fleetManagerId: 'fm_1', requestedAt: ago(1 * DAY + 3 * HOUR) },
    { id: 'pend_3', name: 'Kelvin Ehigiator', email: 'kelvin.ehigiator@example.com', phone: '+234 705 118 6672', roleRequested: ROLES.RIDER, fleetManagerId: 'fm_2', requestedAt: ago(9 * HOUR) },
    { id: 'pend_4', name: 'Faith Aigbe', email: 'faith.aigbe@example.com', phone: '+234 908 442 5310', roleRequested: ROLES.FLEET_MANAGER, fleetManagerId: null, requestedAt: ago(3 * HOUR) },
  ]

  return {
    version: 1,
    users,
    vehicles,
    riders,
    orders,
    transactions,
    pendingUsers,
    sessions: {}, // token -> userId, like a server-side session store
  }
}

// --- persistence -------------------------------------------------------------
let db = null

function persist(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage blocked: data lives in memory until refresh
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted or blocked: fall through to a fresh seed
  }
  const seed = buildSeed()
  persist(seed)
  return seed
}

export function getDb() {
  if (!db) db = load()
  return db
}

// Call after every write so changes survive refresh.
export function saveDb() {
  persist(getDb())
}

// Restore the original seed data but keep active sessions (stay logged in).
export function resetDb() {
  const sessions = getDb().sessions
  db = { ...buildSeed(), sessions }
  persist(db)
}
