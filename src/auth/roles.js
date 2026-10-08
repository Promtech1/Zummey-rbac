// The single source of truth for role names. Always import these constants
// instead of typing "admin" / "fleet_manager" by hand, so a typo becomes an
// import error instead of a silent permission bug.
export const ROLES = {
  ADMIN: 'admin',
  FLEET_MANAGER: 'fleet_manager',
  RIDER: 'rider', // defined for completeness; riders have no web UI yet
}

// Roles that can use the web dashboard (the shared pages).
export const WEB_ROLES = [ROLES.ADMIN, ROLES.FLEET_MANAGER]

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.FLEET_MANAGER]: 'Fleet Manager',
  [ROLES.RIDER]: 'Rider',
}
