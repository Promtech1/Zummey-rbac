import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartColumn } from 'lucide-react'
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatCurrency'
import EmptyState from '../../components/EmptyState/EmptyState'

// Monthly revenue: one series, so one colour (navy) and no legend; the title
// names it. A Chart/Table toggle gives an accessible, exact-number view.
const BAR_COLOR = '#1e2a5e' // --color-primary
const AXIS_TEXT = '#94a3b8'
const GRID = '#eceef2' // --color-line

export default function RevenueChart({ data }) {
  const [view, setView] = useState('chart')
  const hasRevenue = data.some((d) => d.revenue > 0)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-primary">Monthly Revenue</h2>
          <p className="text-xs text-slate-400">Last 10 months · current month to date</p>
        </div>
        {hasRevenue && (
          <div className="flex rounded-full border border-line p-0.5 text-xs" role="group" aria-label="Revenue view">
            {['chart', 'table'].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 capitalize ${view === v ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'}`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasRevenue ? (
        <EmptyState icon={ChartColumn} title="No revenue yet" description="Revenue appears here once your riders complete deliveries." />
      ) : view === 'table' ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-slate-400">
              <th className="py-2 font-medium">Month</th>
              <th className="py-2 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((d) => (
              <tr key={d.month}>
                <td className="py-2">{d.label} {d.month.slice(0, 4)}</td>
                <td className="py-2 text-right tabular-nums">{formatCurrency(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: AXIS_TEXT, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} width={64} tick={{ fill: AXIS_TEXT, fontSize: 12 }} tickFormatter={formatCurrencyCompact} />
              <Tooltip cursor={{ fill: '#f7f8fa' }} content={<RevenueTooltip />} />
              <Bar dataKey="revenue" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}

function RevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-slate-400">{point.label} {point.month.slice(0, 4)}</p>
      <p className="font-semibold text-primary">{formatCurrency(point.revenue)}</p>
    </div>
  )
}
