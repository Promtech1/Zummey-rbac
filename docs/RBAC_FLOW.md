# How RBAC works in Zummey

One app, one sidebar, one set of pages. A user's **role** changes only three things:

1. **Which menu items render** (sidebar filtering)
2. **Which routes are reachable** (route guards)
3. **What data comes back** (server-side scoping)

Only #3 is security. #1 and #2 are UX: they run in the browser, and the browser belongs to the user.

| Role | Constant | Web UI |
|---|---|---|
| `admin` | `ROLES.ADMIN` | Everything, across all fleet owners, plus Fleet Owners and Pending Users |
| `fleet_manager` | `ROLES.FLEET_MANAGER` | Shared pages, own fleet only |
| `rider` | `ROLES.RIDER` | None yet (role defined only) |

---

## The flow at a glance

```
  BROWSER (UX only: anything here can be edited by the user)            SERVER (security)
 ───────────────────────────────────────────────────────────────    ───────────────────────────────
  1. Login.jsx ── email + password ─────────────────────────────────▶ login()
                                                                       checks password, creates a
  2. AuthContext ◀──────────────── { token, user: { id, role … } } ── session: token -> userId
       saves to localStorage ("zummey_session")
       exposes { user, token, role, login, logout }
          │
          ├─▶ 3. Sidebar      menuConfig item.roles.includes(role)  -> which links show
          │
          ├─▶ 4. ProtectedRoute  no user?            -> /login
          │      RoleRoute       role not allowed?   -> /unauthorized
          │
          └─▶ 5. Page -> hook (React Query) -> service
                      service sends ONLY the token ─────────────────▶ 6. authenticate(token)
                      (never "I'm admin", never "my id is fm_1")          token -> user -> role (from DB)
                                                                       7. requireRole(...)
                                                                          wrong role? -> 403
                                                                       8. scopeFilter(session)
                                                                          admin -> {}  (everything)
                                                                          fm    -> { fleetManagerId: own id }
          ◀──────────────────────────────── scoped rows / 403 ───────
       9. Page renders the rows, or ErrorState for 401/403
```

---

## Step by step

| # | What happens | File |
|---|---|---|
| 1 | User submits email + password through a React Query mutation | `src/pages/Login.jsx` |
| 2 | `login()` calls `authService.login`, saves `{ token, user }` to localStorage, clears the query cache | `src/auth/AuthContext.jsx`, `src/auth/sessionStore.js` |
| 3 | Sidebar keeps items whose `roles` include the current role | `src/components/Sidebar/menuConfig.js`, `Sidebar.jsx` |
| 4 | `ProtectedRoute` requires a user; `RoleRoute allowedRoles={[…]}` requires a role | `src/routes/*.jsx` |
| 5 | Pages call hooks (`useVehicles()`…), hooks call services, services go through `request()` | `src/hooks/`, `src/services/` |
| 6 | Every service call sends the token (mock: as an argument; real: `Authorization: Bearer`) | `src/services/request.js`, `axiosInstance.js` |
| 7–8 | The server resolves the token to a user, checks the role, applies the scope | `src/mocks/mockServer.js` |
| 9 | Pages render data, skeletons while loading, `ErrorState` on errors (403 gets its own message) | `src/components/ui/ErrorState.jsx` |
| — | Any 401 fires `zummey:unauthorized`, so AuthContext logs out | `sessionStore.js`, `AuthContext.jsx` |

### Where the "fleetManagerId" rule lives

- **UI:** `FleetOwnerFilter.jsx` renders only for admins (`if (!isAdmin) return null`) and only fetches the owner list for admins (`enabled: isAdmin`).
- **Server (the part that matters):** `scopeFilter()` in `mockServer.js`:
  ```js
  if (session.role === ROLES.ADMIN) {
    return params.fleetManagerId ? { fleetManagerId: params.fleetManagerId } : {}
  }
  return { fleetManagerId: session.id } // a fleet manager's param is ignored
  ```
  Writes use `ownerForWrite()`. A fleet manager's record always lands in their own fleet, whatever the request says.

---

## Seeing it for yourself (dev only)

The **DEV** pill (bottom-right) appears only with `npm run dev` **and** `VITE_USE_MOCKS=true`.

- **Switch user:** Admin / Fleet Manager A (Nosa) / B (Ada) / C (Emeka). It calls the dev-only `loginAs`, then `queryClient.invalidateQueries()` so every page refetches with the new token.
- **Debug panel:** shows the frontend role, the user id, the last API call, the role the **server** saw, and the scope filter it used.
- **Call admin-only getFleetOwners():** hits the API directly, skipping the UI guards. Admin gets 200; everyone else gets 403.
- **Tamper test:** as a fleet manager, run this in the console:
  ```js
  const s = JSON.parse(localStorage.getItem('zummey_session')); s.user.role = 'admin';
  localStorage.setItem('zummey_session', JSON.stringify(s)); location.reload();
  ```
  The sidebar and route guards now let you in, because they trust localStorage. But the dashboard numbers stay yours, and Fleet Owners / Pending Users show **403**. The debug panel shows the role mismatch.

`loginAs` has no real-backend equivalent. It is `null` outside dev + mocks, and its code is stripped from production builds.

---

## Swapping the mocks for a real backend

Every service already has both a mock branch and an axios branch, and pages and hooks don't know which one runs. So the swap touches only config, the service layer, and the dev tools.

**Change these:**

| File | Change |
|---|---|
| `.env` | `VITE_USE_MOCKS=false`, add `VITE_API_URL=https://api.example.com` |
| `src/services/axiosInstance.js` | Only if needed: base URL, timeout, or `withCredentials: true` if the backend uses cookies |
| `src/services/*Service.js` | Make each axios path match the real API (e.g. `/vehicles`). Later, delete the mock branch and the `mockServer` import |
| `src/services/request.js` | Optional: once mocks are gone, simplify to only the axios branch (keep the `ApiError` + 401 handling) |
| `src/components/dev/RoleSwitcher.jsx` | Delete (or keep for mock-only dev). It imports from `mocks/` |
| `src/layouts/DashboardLayout.jsx` | Remove the `<RoleSwitcher />` line if you deleted it |
| `src/mocks/` | Delete once nothing imports it |
| `src/auth/sessionStore.js` | Only if the backend uses httpOnly cookies instead of a bearer token: store just `user`, drop `getStoredToken` |

**These don't change:** pages, hooks, components, `AuthContext`, `ProtectedRoute`, `RoleRoute`, `menuConfig`.

**The real API must return the same shapes** the pages read today. In particular, lists already include joined names:

| Method | Path (suggested) | Roles | Scope | Returns |
|---|---|---|---|---|
| POST | `/auth/login` | public | — | `{ token, user: { id, name, email, role, avatar } }` |
| POST | `/auth/logout` | any | — | `{ success }` |
| GET | `/dashboard/stats` | admin, fm | scoped | `{ totalVehicles, activeVehicles, inactiveVehicles, maintenanceVehicles }` |
| GET | `/vehicles` | admin, fm | scoped | vehicles + `assignedRiderName`, `fleetOwnerName` |
| POST | `/vehicles` | admin, fm | owner = self (fm) / body (admin) | vehicle |
| GET | `/riders` | admin, fm | scoped | riders + `vehicleId`, `vehicleBikeId`, `fleetOwnerName` |
| POST | `/riders` | admin, fm | owner = self (fm) / body (admin) | rider |
| GET | `/orders` | admin, fm | scoped | orders + `riderName`, `vehicleBikeId`, `fleetOwnerName` |
| GET | `/finance/summary` | admin, fm | scoped | `{ totalRevenue, totalWithdrawn, pendingWithdrawals, availableBalance, monthlyRevenue[] }` |
| GET | `/finance/transactions` | admin, fm | scoped | transactions + `fleetOwnerName` |
| POST | `/finance/withdrawals` | **fm only** | self | transaction |
| GET | `/admin/fleet-owners` | **admin only** | all | users + `vehicleCount`, `riderCount` |
| GET | `/admin/pending-users` | **admin only** | all | pending users + `fleetOwnerName` |
| POST | `/admin/pending-users/:id/approve` | **admin only** | all | `{ id, status }` |
| POST | `/admin/pending-users/:id/reject` | **admin only** | all | `{ id, status }` |

Errors should be JSON `{ message }` with the right HTTP status. `request.js` turns them into `ApiError { message, status }`.

---

## Backend checklist: enforce on EVERY endpoint

- [ ] **Read the token** from the `Authorization` header (or session cookie). Missing, invalid or expired → **401**.
- [ ] **Derive the role from the server's own records** (DB or verified JWT claims), never from the request body, query string, or a client-set header.
- [ ] **Check the role** against the endpoint's allowed roles **before** reading any data. Admin-only routes → **403** for everyone else.
- [ ] **Scope the query:** admins get everything (optionally narrowed by `fleetManagerId`); fleet managers get `WHERE fleet_manager_id = <their id>`. Ignore any `fleetManagerId` a non-admin sends.
- [ ] **Scope writes too:** a fleet manager's new records get their id as owner; reject references to another fleet's records (e.g. assigning someone else's vehicle) with **400/404**.
- [ ] **Check ownership on single-record routes** (`GET/PATCH/DELETE /vehicles/:id`): if the record isn't in the caller's scope, return **404** (don't reveal it exists).
- [ ] **Never send secrets** (password hashes, other users' tokens) in responses.
- [ ] **Validate input on the server**, even if the form already did (e.g. withdrawal amount ≤ balance).
- [ ] **No dev shortcuts in production** (`loginAs` must not exist).

> Rule of thumb: if you deleted every `if (role === …)` from the frontend, the app should look messier but **leak nothing**. If it would leak, the check belongs on the server.
