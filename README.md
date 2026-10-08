# Zummey

A delivery and fleet management web app built as one React app with **role-based access control (RBAC)**. Admins and fleet managers share the same screens; their role decides which menu items they see, which routes they can open, and what data the (mock) server returns.

**How the RBAC works, step by step:** [docs/RBAC_FLOW.md](docs/RBAC_FLOW.md)

## Stack

Vite + React (JavaScript), React Router, TanStack React Query, axios, Tailwind CSS v4, Recharts, lucide-react.

## Run it

Requires Node 20.19+ or 22.12+ (Vite 8).

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

Other scripts: `npm run build` (production build to `dist/`), `npm run preview` (serve the build), `npm run lint` (oxlint).

### Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | `true` = use the in-browser mock backend (`src/mocks/`); anything else = call the real API via axios |
| `VITE_API_URL` | `/api` | Base URL of the real API (only used when mocks are off) |
| `VITE_GOOGLE_MAPS_KEY` | empty | Reserved for a future Google Maps version of `TripMap`; the app uses a placeholder map without it |

## Mock login credentials

All accounts use the password **`password123`**. The login page also has one-click "Demo accounts" buttons.

| Account | Email | Role | Data they see |
|---|---|---|---|
| Admin User | `admin@zummey.com` | admin | Everything: 47 vehicles, 20 riders, 15 orders, plus Fleet Owners and Pending Users |
| Nosa Osagie (Fleet Manager A) | `fleet1@zummey.com` | fleet_manager | Own fleet: 22 vehicles, 12 riders, 9 orders |
| Ada Okoro (Fleet Manager B) | `fleet2@zummey.com` | fleet_manager | Own fleet: 15 vehicles, 8 riders, 6 orders |
| Emeka Eze (Fleet Manager C) | `fleet3@zummey.com` | fleet_manager | Own fleet: 10 vehicles, **0 riders** (shows the empty state) |

Mock data lives in `localStorage` (`zummey_mock_db_v1`), so changes like new riders or approvals survive a refresh. Approving a pending fleet manager creates an account that can log in with `password123`.

## The dev role switcher

In development (`npm run dev`) with `VITE_USE_MOCKS=true`, a **DEV** pill appears at the bottom-right once you're logged in. It is not included in production builds.

- **Switch user:** click Admin or Fleet Manager A/B/C to become that user instantly. It asks the mock server for a real session token for that user (the dev-only `loginAs` endpoint), then invalidates every React Query cache so each page refetches with the new scope. If you're on an admin-only page and switch to a fleet manager, the route guard sends you to `/unauthorized`.
- **Debug panel:** shows the role the frontend thinks you have, your user id, the last API call, the role the *server* saw, and the scope filter it applied, e.g. `filter: {} (admin)` or `filter: { fleetManagerId: 'fm_2' }`.
- **Call admin-only getFleetOwners():** calls an admin endpoint directly, skipping the UI. Admins get 200; fleet managers get 403.
- **Reset mock data:** restores the original seed data (you stay logged in).

Try the **tamper test** in [docs/RBAC_FLOW.md](docs/RBAC_FLOW.md#seeing-it-for-yourself-dev-only): edit your role in localStorage and watch the UI let you in while the server still says 403.

## Project structure

```
src/
  auth/        roles, AuthContext, useAuth, session storage
  routes/      AppRoutes, ProtectedRoute, RoleRoute
  layouts/     AuthLayout, DashboardLayout
  components/  Sidebar (menuConfig), Topbar, StatCard, VehicleTable, OrderCard,
               TripMap, EmptyState, FleetOwnerFilter, ui/, dev/RoleSwitcher
  pages/       Login, Unauthorized, Dashboard, FleetManagement, Riders, Orders,
               Finance, Notifications, Settings, HelpSupport, admin/
  services/    one file per API area + request.js (mock vs. axios switch)
  mocks/       mockDb (seed + persistence), mockServer (auth, roles, scoping)
  hooks/       React Query hooks wrapping the services
  utils/       formatCurrency (₦), formatDate, cleanParams
```

Swapping the mocks for a real backend, and what that backend must enforce, is covered in [docs/RBAC_FLOW.md](docs/RBAC_FLOW.md#swapping-the-mocks-for-a-real-backend).
