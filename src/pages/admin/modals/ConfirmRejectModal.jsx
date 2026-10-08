import { X } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { FormError } from '../../../components/ui/Field'

// Asks before rejecting a sign-up, because rejecting deletes the request.
export default function ConfirmRejectModal({ user, onCancel, onConfirm, loading, error }) {
  return (
    <Modal
      title="Reject this request?"
      onClose={loading ? () => {} : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" icon={X} loading={loading} onClick={onConfirm}>Reject</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">This can&apos;t be undone.</p>
      <p className="rounded-xl bg-page px-4 py-3 text-sm">
        <span className="block font-medium text-slate-800">{user.name}</span>
        <span className="block text-slate-500">{user.email}</span>
      </p>
      <FormError error={error} />
    </Modal>
  )
}
