import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useFleetOwners } from '../../hooks/useAdmin'
import { FilterSelect } from '../ui/Toolbar'

// Admin-only dropdown: "show me one fleet owner's data".
// It sends the optional `fleetManagerId` param, which the server honours for
// admins only. Fleet managers never see this, and if they sent the param
// anyway the server would ignore it (see scopeFilter in mockServer.js).
export default function FleetOwnerFilter({ value, onChange }) {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN
  const owners = useFleetOwners({ enabled: isAdmin })

  if (!isAdmin) return null
  return (
    <FilterSelect label="Fleet owner" value={value} onChange={onChange}>
      <option value="">All fleet owners</option>
      {owners.data?.map((owner) => (
        <option key={owner.id} value={owner.id}>{owner.name}</option>
      ))}
    </FilterSelect>
  )
}
