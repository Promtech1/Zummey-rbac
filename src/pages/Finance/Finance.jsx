import { useState } from 'react'
import { ArrowDownToLine, Banknote, ReceiptText, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { ROLES } from '../../auth/roles'
import { useFinanceSummary, useTransactions } from '../../hooks/useFinance'
import { cleanParams } from '../../utils/cleanParams'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import StatCard from '../../components/StatCard/StatCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import FleetOwnerFilter from '../../components/FleetOwnerFilter/FleetOwnerFilter'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/ui/PageHeader'
import StatusPill from '../../components/ui/StatusPill'
import { Skeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { FilterSelect, Toolbar } from '../../components/ui/Toolbar'
import RevenueChart from './RevenueChart'
import WithdrawModal from './modals/WithdrawModal'

export default function Finance() {
  const { role } = useAuth()
  const isAdmin = role === ROLES.ADMIN
  // Only fleet managers have a wallet to withdraw from. The server enforces
  // this too (requestWithdrawal returns 403 for admins).
  const canWithdraw = role === ROLES.FLEET_MANAGER

  const [fleetOwnerId, setFleetOwnerId] = useState('')
  const [txnType, setTxnType] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)

  const scope = cleanParams({ fleetManagerId: fleetOwnerId })
  const summary = useFinanceSummary(scope)
  const transactions = useTransactions({ ...scope, ...cleanParams({ type: txnType }) })

  return (
    <>
      <PageHeader
        title="Finance & Reports"
        subtitle={isAdmin ? (fleetOwnerId ? 'One fleet owner' : 'Totals across all fleet owners') : 'Your earnings and withdrawals'}
      >
        <FleetOwnerFilter value={fleetOwnerId} onChange={setFleetOwnerId} />
        {canWithdraw && (
          <Button icon={Banknote} onClick={() => setShowWithdraw(true)} disabled={!summary.data}>Withdraw</Button>
        )}
      </PageHeader>

      <div className="space-y-5">
        {summary.isError ? (
          <Card><ErrorState error={summary.error} onRetry={summary.refetch} /></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Revenue" value={formatCurrency(summary.data?.totalRevenue)} icon={TrendingUp} tone="orange" loading={summary.isPending} hint="Last 10 months" />
            <StatCard label="Available Balance" value={formatCurrency(summary.data?.availableBalance)} icon={Wallet} tone="purple" loading={summary.isPending} hint={summary.data?.pendingWithdrawals ? `${formatCurrency(summary.data.pendingWithdrawals)} withdrawal pending` : undefined} />
            <StatCard label="Total Withdrawn" value={formatCurrency(summary.data?.totalWithdrawn)} icon={ArrowDownToLine} tone="blue" loading={summary.isPending} />
          </div>
        )}

        <Card className="p-5">
          {summary.isPending ? (
            <Skeleton className="h-[320px]" />
          ) : summary.isSuccess && (
            <RevenueChart data={summary.data.monthlyRevenue} />
          )}
        </Card>

        <Card>
          <Toolbar>
            <h2 className="mr-auto font-semibold text-primary">Transactions</h2>
            <FilterSelect label="Transaction type" value={txnType} onChange={setTxnType}>
              <option value="">All transactions</option>
              <option value="credit">Earnings</option>
              <option value="debit">Withdrawals</option>
            </FilterSelect>
          </Toolbar>
          {transactions.isPending ? (
            <TableSkeleton rows={6} columns={6} />
          ) : transactions.isError ? (
            <ErrorState error={transactions.error} onRetry={transactions.refetch} />
          ) : transactions.data.length === 0 ? (
            <EmptyState icon={ReceiptText} title="No transactions yet" description="Earnings payouts and withdrawals will show up here." />
          ) : (
            <TransactionsTable transactions={transactions.data} showFleetOwner={isAdmin} />
          )}
        </Card>
      </div>

      {showWithdraw && summary.data && (
        <WithdrawModal availableBalance={summary.data.availableBalance} onClose={() => setShowWithdraw(false)} />
      )}
    </>
  )
}

function TransactionsTable({ transactions, showFleetOwner }) {
  const headers = ['Date', 'Reference', 'Description', ...(showFleetOwner ? ['Fleet Owner'] : []), 'Status', 'Amount']
  return (
    <div className="thin-scroll max-h-[480px] overflow-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-line text-xs text-slate-400">
            {headers.map((h) => <th key={h} className={`whitespace-nowrap px-5 py-3 font-medium ${h === 'Amount' ? 'text-right' : ''}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-page/60">
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(t.date)}</td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">{t.reference}</td>
              <td className="whitespace-nowrap px-5 py-3">{t.description}</td>
              {showFleetOwner && <td className="whitespace-nowrap px-5 py-3">{t.fleetOwnerName}</td>}
              <td className="px-5 py-3"><StatusPill status={t.status} /></td>
              <td className={`whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums ${t.type === 'credit' ? 'text-green-700' : 'text-slate-700'}`}>
                {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
