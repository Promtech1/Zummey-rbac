import { useState } from 'react'
import { Bike, Plus } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useVehicles } from '../../hooks/useVehicles'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { cleanParams } from '../../utils/cleanParams'
import VehicleTable from '../../components/VehicleTable/VehicleTable'
import EmptyState from '../../components/EmptyState/EmptyState'
import FleetOwnerFilter from '../../components/FleetOwnerFilter/FleetOwnerFilter'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { FilterSelect, SearchInput, Toolbar } from '../../components/ui/Toolbar'
import AddVehicleModal from './modals/AddVehicleModal'

export default function FleetManagement() {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [fleetOwnerId, setFleetOwnerId] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const vehicles = useVehicles(cleanParams({ search: debouncedSearch, status, fleetManagerId: fleetOwnerId }))

  return (
    <>
      <PageHeader
        title="Fleet Management"
        subtitle={isAdmin ? 'Every vehicle across all fleet owners' : 'Vehicles in your fleet'}
      >
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Vehicle</Button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search bike ID, name, plate…" className="w-full sm:w-72" />
          <FilterSelect label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>
            <option value="active">Online</option>
            <option value="inactive">Offline</option>
            <option value="maintenance">Maintenance</option>
          </FilterSelect>
          <FleetOwnerFilter value={fleetOwnerId} onChange={setFleetOwnerId} />
          {vehicles.data && (
            <span className="ml-auto text-sm text-slate-400">
              {vehicles.data.length} vehicle{vehicles.data.length === 1 ? '' : 's'}
            </span>
          )}
        </Toolbar>

        {vehicles.isPending ? (
          <TableSkeleton rows={8} columns={9} />
        ) : vehicles.isError ? (
          <ErrorState error={vehicles.error} onRetry={vehicles.refetch} />
        ) : vehicles.data.length === 0 ? (
          <EmptyState icon={Bike} title="No vehicles found" description="Try a different search or filter, or add a vehicle." />
        ) : (
          <VehicleTable vehicles={vehicles.data} showFleetOwner={isAdmin} />
        )}
      </Card>

      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}
    </>
  )
}
