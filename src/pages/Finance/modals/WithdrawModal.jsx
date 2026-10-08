import { useState } from 'react'
import { useRequestWithdrawal } from '../../../hooks/useFinance'
import { formatCurrency } from '../../../utils/formatCurrency'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { FormError, SelectField, TextField } from '../../../components/ui/Field'

const BANKS = ['Access Bank', 'First Bank', 'GTBank', 'Moniepoint', 'Opay', 'UBA', 'Zenith Bank']

export default function WithdrawModal({ availableBalance, onClose }) {
  const withdraw = useRequestWithdrawal()
  const [form, setForm] = useState({ amount: '', bankName: BANKS[0], accountNumber: '' })
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // Quick check for a nicer experience; the server re-checks the balance.
  const tooMuch = Number(form.amount) > availableBalance

  return (
    <Modal
      title="Withdraw funds"
      subtitle={`Available balance: ${formatCurrency(availableBalance)}`}
      onClose={onClose}
      onSubmit={() => withdraw.mutate({ ...form, amount: Number(form.amount) }, { onSuccess: onClose })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={withdraw.isPending} disabled={tooMuch}>Request withdrawal</Button>
        </>
      }
    >
      <TextField
        label="Amount (₦)"
        type="number"
        min="1"
        step="1"
        required
        inputMode="numeric"
        value={form.amount}
        onChange={update('amount')}
        placeholder="e.g. 250000"
        hint={tooMuch ? 'That is more than your available balance.' : form.amount ? formatCurrency(form.amount) : undefined}
      />
      <SelectField label="Bank" value={form.bankName} onChange={update('bankName')}>
        {BANKS.map((b) => <option key={b}>{b}</option>)}
      </SelectField>
      <TextField
        label="Account number"
        required
        inputMode="numeric"
        pattern="\d{10}"
        maxLength={10}
        title="10-digit NUBAN account number"
        value={form.accountNumber}
        onChange={update('accountNumber')}
        placeholder="10-digit account number"
      />
      <p className="text-xs text-slate-400">Withdrawals show as Pending until processed.</p>
      <FormError error={withdraw.error} />
    </Modal>
  )
}
