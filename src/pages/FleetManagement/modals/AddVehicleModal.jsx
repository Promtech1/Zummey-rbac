import { useState } from 'react'
import { useAuth } from '../../../auth/useAuth'
import { ROLES } from '../../../auth/roles'
import { useCreateVehicle } from '../../../hooks/useVehicles'
import { useFleetOwners } from '../../../hooks/useAdmin'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { FormError, SelectField, TextField } from '../../../components/ui/Field'

const MANUFACTURERS = ['Bajaj', 'TVS', 'Honda', 'Haojue', 'Qlink', 'Suzuki', 'Yamaha']

export default function AddVehicleModal({ onClose }) {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN
  // Admins add vehicles on behalf of a fleet owner, so they pick one.
  // Fleet managers don't: the server puts the vehicle in their own fleet.
  const owners = useFleetOwners({ enabled: isAdmin })
  const createVehicle = useCreateVehicle()

  const [form, setForm] = useState({ name: '', manufacturer: MANUFACTURERS[0], licenseNo: '', gpsSerial: '', fleetManagerId: '' })
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit() {
    const { fleetManagerId, ...vehicle } = form
    createVehicle.mutate(isAdmin ? { ...vehicle, fleetManagerId } : vehicle, { onSuccess: onClose })
  }

  return (
    <Modal
      title="Add Vehicle"
      subtitle="New vehicles start offline until a rider is assigned."
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createVehicle.isPending}>Add Vehicle</Button>
        </>
      }
    >
      {isAdmin && (
        <SelectField label="Fleet owner" required value={form.fleetManagerId} onChange={update('fleetManagerId')}>
          <option value="" disabled>{owners.isPending ? 'Loading…' : 'Choose a fleet owner'}</option>
          {owners.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </SelectField>
      )}
      <TextField label="Bike name" required value={form.name} onChange={update('name')} placeholder="e.g. Boxer BM150" />
      <SelectField label="Manufacturer" value={form.manufacturer} onChange={update('manufacturer')}>
        {MANUFACTURERS.map((m) => <option key={m}>{m}</option>)}
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="License No." required value={form.licenseNo} onChange={update('licenseNo')} placeholder="BEN-123-AB" />
        <TextField label="GPS Tracker SN" required value={form.gpsSerial} onChange={update('gpsSerial')} placeholder="GT06-123456" />
      </div>
      <FormError error={createVehicle.error} />
    </Modal>
  )
}
