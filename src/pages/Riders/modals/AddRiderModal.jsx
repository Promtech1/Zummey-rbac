import { useState } from 'react'
import { useAuth } from '../../../auth/useAuth'
import { ROLES } from '../../../auth/roles'
import { useCreateRider } from '../../../hooks/useRiders'
import { useVehicles } from '../../../hooks/useVehicles'
import { useFleetOwners } from '../../../hooks/useAdmin'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { FormError, SelectField, TextField } from '../../../components/ui/Field'

export default function AddRiderModal({ onClose }) {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN
  const owners = useFleetOwners({ enabled: isAdmin })
  const createRider = useCreateRider()

  const [form, setForm] = useState({ name: '', phone: '', email: '', licenseNo: '', vehicleId: '', fleetManagerId: '' })
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // Vehicles the new rider could take: the server scopes this list, so a
  // fleet manager only ever sees their own bikes. An admin must pick the
  // fleet owner first, then sees that owner's bikes.
  const vehicles = useVehicles(isAdmin ? { fleetManagerId: form.fleetManagerId } : {}, {
    enabled: !isAdmin || Boolean(form.fleetManagerId),
  })
  const freeVehicles = (vehicles.data ?? []).filter((v) => !v.assignedRiderId && v.status !== 'maintenance')

  function handleSubmit() {
    const { fleetManagerId, ...rider } = form
    createRider.mutate(isAdmin ? { ...rider, fleetManagerId } : rider, { onSuccess: onClose })
  }

  return (
    <Modal
      title="Add Rider"
      subtitle="Add a driver to the fleet and optionally assign a vehicle."
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createRider.isPending}>Add Rider</Button>
        </>
      }
    >
      {isAdmin && (
        <SelectField
          label="Fleet owner"
          required
          value={form.fleetManagerId}
          onChange={(e) => setForm((f) => ({ ...f, fleetManagerId: e.target.value, vehicleId: '' }))}
        >
          <option value="" disabled>{owners.isPending ? 'Loading…' : 'Choose a fleet owner'}</option>
          {owners.data?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </SelectField>
      )}
      <TextField label="Full name" required value={form.name} onChange={update('name')} placeholder="e.g. Osaro Ighodaro" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Phone" type="tel" required value={form.phone} onChange={update('phone')} placeholder="+234 803 000 0000" />
        <TextField label="Email" type="email" required value={form.email} onChange={update('email')} placeholder="rider@example.com" />
      </div>
      <TextField label="Driver's license No." required value={form.licenseNo} onChange={update('licenseNo')} placeholder="EDO-DL-12345" />
      <SelectField
        label="Assign vehicle (optional)"
        value={form.vehicleId}
        onChange={update('vehicleId')}
        disabled={isAdmin && !form.fleetManagerId}
        hint={isAdmin && !form.fleetManagerId ? 'Choose a fleet owner first.' : `${freeVehicles.length} unassigned vehicle(s) available.`}
      >
        <option value="">No vehicle yet</option>
        {freeVehicles.map((v) => <option key={v.id} value={v.id}>{v.bikeId} · {v.name} ({v.licenseNo})</option>)}
      </SelectField>
      <FormError error={createRider.error} />
    </Modal>
  )
}
