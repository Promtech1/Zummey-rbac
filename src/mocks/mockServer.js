// =============================================================================
// Mock backend
//
// Everything in this file belongs on the REAL backend later. It is written
// to behave like one so you can see where RBAC security actually lives:
//
//   1. authenticate(token)  -> work out WHO is calling (from the token only)
//   2. requireRole(...)     -> reject callers whose role isn't allowed (403)
//   3. scopeFilter(...)     -> decide WHICH rows they may see
//
// The frontend never sends "I am admin" or "give me fm_2's data". It sends a
// token, and the server decides. That's why hiding a menu item or guarding a
// route in React is only UX: a user can always call the API directly, so the
// API itself must enforce the rules.
// =============================================================================
import { ROLES, WEB_ROLES } from '../auth/roles'
import { getDb, saveDb } from './mockDb'

// --- infrastructure ----------------------------------------------------------

// Simulated network latency (300-600ms) so loading states are visible.
const delay = () => new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300))

// Errors carry an HTTP-like status so the UI handles mock and real errors the same way.
function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

// Records the last call so the dev debug panel can show which scope was applied.
let lastCall = null
const listeners = new Set()

function recordCall(endpoint, session, filter, status = 200) {
  lastCall = { endpoint, role: session.role, userId: session.id, filter, status, at: Date.now() }
  listeners.forEach((listener) => listener())
}

export function getLastMockCall() {
  return lastCall
}

export function subscribeToMockCalls(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// --- the three RBAC building blocks -----------------------------------------

// 1. Who is calling? A real backend verifies a JWT or looks up a session.
//    We look the token up in the session store. Role comes from the DATABASE,
//    not from anything the client claims.
function authenticate(token) {
  const db = getDb()
  const userId = token ? db.sessions[token] : null
  const user = userId ? db.users.find((u) => u.id === userId) : null
  if (!user) throw httpError(401, 'Your session has expired. Please log in again.')
  return { id: user.id, role: user.role }
}

// 2. Is this role allowed to call this endpoint at all?
//    Admin-only endpoints throw 403 Forbidden for everyone else. Even if the
//    frontend forgot to hide a button or guard a route, the data stays safe.
function requireRole(session, allowedRoles, endpoint) {
  if (!allowedRoles.includes(session.role)) {
    recordCall(endpoint, session, null, 403)
    throw httpError(403, "Forbidden: your role doesn't have access to this resource.")
  }
}

// 3. Which rows may this caller see?
//    Admin: everything ({}), or one fleet manager if they ask for it.
//    Fleet manager: ONLY their own rows. Any fleetManagerId they send is
//    ignored, so they can't widen their scope by editing a request.
function scopeFilter(session, params = {}) {
  if (session.role === ROLES.ADMIN) {
    return params.fleetManagerId ? { fleetManagerId: params.fleetManagerId } : {}
  }
  return { fleetManagerId: session.id }
}

function applyScope(rows, filter) {
  return rows.filter((row) => Object.entries(filter).every(([key, value]) => row[key] === value))
}

// --- small helpers -----------------------------------------------------------

const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`

const nameOf = (list, id) => list.find((item) => item.id === id)?.name ?? null

const includesText = (search, ...fields) =>
  !search || fields.some((f) => String(f ?? '').toLowerCase().includes(search.toLowerCase()))

function publicUser(user) {
  const { password: _password, ...safe } = user // never send password fields to the client
  return safe
}

function createSession(user) {
  const db = getDb()
  const token = `mock_${crypto.randomUUID()}`
  db.sessions[token] = user.id
  saveDb()
  return { token, user: publicUser(user) }
}

function requireFields(data, fields) {
  const missing = fields.filter((f) => !String(data[f] ?? '').trim())
  if (missing.length) throw httpError(400, `Missing required field(s): ${missing.join(', ')}`)
}

// Admin creates records on behalf of a fleet owner, so they must pick one.
// A fleet manager always creates in their own fleet: whatever they send is ignored.
function ownerForWrite(session, data) {
  if (session.role !== ROLES.ADMIN) return session.id
  const owner = getDb().users.find(
    (u) => u.id === data.fleetManagerId && u.role === ROLES.FLEET_MANAGER,
  )
  if (!owner) throw httpError(400, 'Choose which fleet owner this belongs to.')
  return owner.id
}

// =============================================================================
// Auth endpoints
// =============================================================================

export async function login(email, password) {
  await delay()
  const db = getDb()
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
  if (!user || user.password !== password) throw httpError(401, 'Invalid email or password.')
  if (user.status !== 'active') throw httpError(403, 'This account has been suspended.')
  return createSession(user)
}

export async function logout(token) {
  await delay()
  const db = getDb()
  delete db.sessions[token]
  saveDb()
  return { success: true }
}

// -----------------------------------------------------------------------------
// DEV-ONLY SHORTCUT: loginAs(userId)
//
// Issues a session for ANY user without a password, so the RoleSwitcher can
// jump between roles instantly. This has NO real-backend equivalent. A real
// API must never let the client choose who it is; that would defeat every
// check in this file.
//
// It only exists when BOTH are true:
//   import.meta.env.DEV            (running `npm run dev`, not a build)
//   VITE_USE_MOCKS !== "false"     (talking to this mock, not a real API)
// Otherwise `loginAs` is null. In `vite build`, import.meta.env.DEV becomes
// the literal `false`, so the minifier drops this whole function from the
// production bundle.
// -----------------------------------------------------------------------------
export const loginAs =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false'
    ? async (userId) => {
        await delay()
        const user = getDb().users.find((u) => u.id === userId)
        if (!user) throw httpError(404, 'loginAs: user not found')
        return createSession(user)
      }
    : null

// =============================================================================
// Shared endpoints (admin + fleet_manager), scoped by role
// =============================================================================

export async function getDashboardStats(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getDashboardStats')
  const filter = scopeFilter(session, params)
  recordCall('getDashboardStats', session, filter)

  const vehicles = applyScope(getDb().vehicles, filter)
  const count = (status) => vehicles.filter((v) => v.status === status).length
  return {
    totalVehicles: vehicles.length,
    activeVehicles: count('active'),
    inactiveVehicles: count('inactive'),
    maintenanceVehicles: count('maintenance'),
  }
}

export async function getVehicles(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getVehicles')
  const filter = scopeFilter(session, params)
  recordCall('getVehicles', session, filter)

  const db = getDb()
  return applyScope(db.vehicles, filter)
    .filter((v) => !params.status || v.status === params.status)
    .filter((v) => includesText(params.search, v.bikeId, v.name, v.licenseNo, v.gpsSerial))
    .map((v) => ({
      ...v,
      assignedRiderName: nameOf(db.riders, v.assignedRiderId),
      fleetOwnerName: nameOf(db.users, v.fleetManagerId),
    }))
}

export async function createVehicle(token, data) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'createVehicle')
  requireFields(data, ['name', 'manufacturer', 'licenseNo', 'gpsSerial'])
  const fleetManagerId = ownerForWrite(session, data)
  recordCall('createVehicle', session, { fleetManagerId })

  const db = getDb()
  const nextNumber = Math.max(0, ...db.vehicles.map((v) => Number(v.bikeId.slice(3)))) + 1
  const vehicle = {
    id: newId('veh'),
    bikeId: `ZB-${String(nextNumber).padStart(3, '0')}`,
    name: data.name.trim(),
    manufacturer: data.manufacturer.trim(),
    licenseNo: data.licenseNo.trim().toUpperCase(),
    gpsSerial: data.gpsSerial.trim().toUpperCase(),
    status: 'inactive', // becomes active once a rider is assigned
    photo: null,
    assignedRiderId: null,
    fleetManagerId,
    createdAt: new Date().toISOString(),
  }
  db.vehicles.push(vehicle)
  saveDb()
  return vehicle
}

export async function getRiders(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getRiders')
  const filter = scopeFilter(session, params)
  recordCall('getRiders', session, filter)

  const db = getDb()
  return applyScope(db.riders, filter)
    .filter((r) => includesText(params.search, r.name, r.email, r.phone))
    .map((r) => {
      const vehicle = db.vehicles.find((v) => v.assignedRiderId === r.id)
      return {
        ...r,
        vehicleId: vehicle?.id ?? null,
        vehicleBikeId: vehicle?.bikeId ?? null,
        fleetOwnerName: nameOf(db.users, r.fleetManagerId),
      }
    })
}

export async function createRider(token, data) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'createRider')
  requireFields(data, ['name', 'phone', 'email', 'licenseNo'])
  const fleetManagerId = ownerForWrite(session, data)
  recordCall('createRider', session, { fleetManagerId })

  const db = getDb()
  const rider = {
    id: newId('rdr'),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    licenseNo: data.licenseNo.trim().toUpperCase(),
    status: 'inactive',
    fleetManagerId,
    joinedAt: new Date().toISOString(),
  }

  // Optional vehicle assignment. The vehicle must belong to the SAME fleet,
  // so nobody can attach their rider to someone else's bike.
  if (data.vehicleId) {
    const vehicle = db.vehicles.find((v) => v.id === data.vehicleId)
    if (!vehicle || vehicle.fleetManagerId !== fleetManagerId) {
      throw httpError(400, 'That vehicle is not in this fleet.')
    }
    if (vehicle.assignedRiderId) throw httpError(409, 'That vehicle already has a rider.')
    vehicle.assignedRiderId = rider.id
    vehicle.status = 'active'
    rider.status = 'active'
  }

  db.riders.push(rider)
  saveDb()
  return rider
}

export async function getOrders(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getOrders')
  const filter = scopeFilter(session, params)
  recordCall('getOrders', session, filter)

  const db = getDb()
  return applyScope(db.orders, filter)
    .filter((o) => !params.status || o.status === params.status)
    .filter((o) => includesText(params.search, o.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => ({
      ...o,
      riderName: nameOf(db.riders, o.riderId),
      vehicleBikeId: db.vehicles.find((v) => v.id === o.vehicleId)?.bikeId ?? null,
      fleetOwnerName: nameOf(db.users, o.fleetManagerId),
    }))
}

export async function getFinanceSummary(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getFinanceSummary')
  const filter = scopeFilter(session, params)
  recordCall('getFinanceSummary', session, filter)

  const txns = applyScope(getDb().transactions, filter)
  const sum = (list) => list.reduce((total, t) => total + t.amount, 0)
  const credits = txns.filter((t) => t.type === 'credit' && t.status === 'successful')
  const withdrawn = txns.filter((t) => t.type === 'debit' && t.status === 'successful')
  const pending = txns.filter((t) => t.type === 'debit' && t.status === 'pending')

  // Revenue per month for the last 10 months (oldest first).
  const now = new Date()
  const monthlyRevenue = Array.from({ length: 10 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (9 - i), 1)
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    return {
      month: key,
      label: month.toLocaleString('en-NG', { month: 'short' }),
      revenue: sum(credits.filter((t) => t.date.startsWith(key))),
    }
  })

  return {
    totalRevenue: sum(credits),
    totalWithdrawn: sum(withdrawn),
    pendingWithdrawals: sum(pending),
    availableBalance: sum(credits) - sum(withdrawn) - sum(pending),
    monthlyRevenue,
  }
}

export async function getTransactions(token, params = {}) {
  await delay()
  const session = authenticate(token)
  requireRole(session, WEB_ROLES, 'getTransactions')
  const filter = scopeFilter(session, params)
  recordCall('getTransactions', session, filter)

  const db = getDb()
  return applyScope(db.transactions, filter)
    .filter((t) => !params.type || t.type === params.type)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => ({ ...t, fleetOwnerName: nameOf(db.users, t.fleetManagerId) }))
}

// Only fleet managers own a wallet, so only they can withdraw.
export async function requestWithdrawal(token, data) {
  await delay()
  const session = authenticate(token)
  requireRole(session, [ROLES.FLEET_MANAGER], 'requestWithdrawal')
  const filter = { fleetManagerId: session.id }
  recordCall('requestWithdrawal', session, filter)

  const amount = Number(data.amount)
  requireFields(data, ['bankName', 'accountNumber'])
  if (!amount || amount <= 0) throw httpError(400, 'Enter an amount greater than zero.')

  const db = getDb()
  const txns = applyScope(db.transactions, filter)
  const sum = (list) => list.reduce((total, t) => total + t.amount, 0)
  const balance =
    sum(txns.filter((t) => t.type === 'credit' && t.status === 'successful')) -
    sum(txns.filter((t) => t.type === 'debit' && t.status !== 'failed'))
  if (amount > balance) throw httpError(400, 'Amount is more than your available balance.')

  const txn = {
    id: newId('txn'),
    reference: `ZMY${Date.now().toString().slice(-8)}`,
    fleetManagerId: session.id,
    type: 'debit',
    description: `Withdrawal to ${data.bankName.trim()} ****${String(data.accountNumber).slice(-4)}`,
    amount,
    status: 'pending',
    date: new Date().toISOString(),
  }
  db.transactions.push(txn)
  saveDb()
  return txn
}

// =============================================================================
// Admin-only endpoints
//
// requireRole([ADMIN]) runs BEFORE any data is read. A fleet manager calling
// these gets a 403 even if they bypass the React route guard (for example by
// calling the service from the console). This is the real protection.
// =============================================================================

export async function getFleetOwners(token) {
  await delay()
  const session = authenticate(token)
  requireRole(session, [ROLES.ADMIN], 'getFleetOwners')
  recordCall('getFleetOwners', session, {})

  const db = getDb()
  return db.users
    .filter((u) => u.role === ROLES.FLEET_MANAGER)
    .map((u) => ({
      ...publicUser(u),
      vehicleCount: db.vehicles.filter((v) => v.fleetManagerId === u.id).length,
      riderCount: db.riders.filter((r) => r.fleetManagerId === u.id).length,
    }))
}

export async function getPendingUsers(token) {
  await delay()
  const session = authenticate(token)
  requireRole(session, [ROLES.ADMIN], 'getPendingUsers')
  recordCall('getPendingUsers', session, {})

  const db = getDb()
  return db.pendingUsers
    .map((p) => ({ ...p, fleetOwnerName: nameOf(db.users, p.fleetManagerId) }))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}

export async function approvePendingUser(token, pendingUserId) {
  await delay()
  const session = authenticate(token)
  requireRole(session, [ROLES.ADMIN], 'approvePendingUser')
  recordCall('approvePendingUser', session, {})

  const db = getDb()
  const pending = db.pendingUsers.find((p) => p.id === pendingUserId)
  if (!pending) throw httpError(404, 'This request no longer exists.')

  const now = new Date().toISOString()
  if (pending.roleRequested === ROLES.FLEET_MANAGER) {
    // New fleet owners can log in right away with the mock password.
    db.users.push({
      id: newId('fm'),
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      role: ROLES.FLEET_MANAGER,
      password: 'password123',
      avatar: null,
      status: 'active',
      joinedAt: now,
    })
  } else {
    db.riders.push({
      id: newId('rdr'),
      name: pending.name,
      phone: pending.phone,
      email: pending.email,
      licenseNo: 'PENDING',
      status: 'inactive',
      fleetManagerId: pending.fleetManagerId,
      joinedAt: now,
    })
  }
  db.pendingUsers = db.pendingUsers.filter((p) => p.id !== pendingUserId)
  saveDb()
  return { id: pendingUserId, status: 'approved' }
}

export async function rejectPendingUser(token, pendingUserId) {
  await delay()
  const session = authenticate(token)
  requireRole(session, [ROLES.ADMIN], 'rejectPendingUser')
  recordCall('rejectPendingUser', session, {})

  const db = getDb()
  if (!db.pendingUsers.some((p) => p.id === pendingUserId)) {
    throw httpError(404, 'This request no longer exists.')
  }
  db.pendingUsers = db.pendingUsers.filter((p) => p.id !== pendingUserId)
  saveDb()
  return { id: pendingUserId, status: 'rejected' }
}
