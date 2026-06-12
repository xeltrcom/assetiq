'use client'

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Download, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  LAPTOP:           '#534AB7',
  DESKTOP:          '#1D9E75',
  SERVER:           '#D85A30',
  PRINTER:          '#378ADD',
  NETWORK_DEVICE:   '#9333EA',
  MOBILE:           '#D4537E',
  SOFTWARE_LICENSE: '#EF9F27',
  FURNITURE:        '#888780',
  VEHICLE:          '#0EA5E9',
  OTHER:            '#B4B2A9',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:        '#1D9E75',
  EXPIRING_SOON: '#EF9F27',
  EXPIRED:       '#E24B4A',
  MAINTENANCE:   '#378ADD',
  INACTIVE:      '#B4B2A9',
  RETIRED:       '#888780',
}

export function ReportsClient({
  categoryBreakdown, statusBreakdown, expiringNext30,
  expiringNext90, totalValue, recentlyAdded, topLocations,
}: any) {

  const categoryData = categoryBreakdown.map((c: any) => ({
    name:  c.category.replace('_', ' '),
    value: c._count._all,
    color: CATEGORY_COLORS[c.category] ?? '#B4B2A9',
  }))

  const statusData = statusBreakdown.map((s: any) => ({
    name:  s.status.replace('_', ' '),
    value: s._count._all,
    color: STATUS_COLORS[s.status] ?? '#B4B2A9',
  }))

  const totalAssets = categoryData.reduce((a: number, c: any) => a + c.value, 0)

  function exportPDF() {
    window.open('/api/reports/pdf', '_blank')
  }
  function exportCSV() {
    const rows = [
      ['Category', 'Count'],
      ...categoryData.map((c: any) => [c.name, c.value]),
      [],
      ['Status', 'Count'],
      ...statusData.map((s: any) => [s.name, s.value]),
      [],
      ['Total assets', totalAssets],
      ['Purchase value', totalValue.purchasePrice ?? 0],
      ['Current value',  totalValue.currentValue  ?? 0],
      ['Expiring in 30 days', expiringNext30],
      ['Expiring in 90 days', expiringNext90],
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `assetiq-report-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">Reports</h1>
       <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Download size={14} /> Export PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* KPI Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total assets',       value: totalAssets,                                    icon: Package,       color: 'text-brand-600' },
            { label: 'Purchase value',      value: `₹${((totalValue.purchasePrice??0)/100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Current value',       value: `₹${((totalValue.currentValue??0)/100000).toFixed(1)}L`,  icon: TrendingUp, color: 'text-blue-600' },
            { label: 'Expiring in 30 days', value: expiringNext30,                                icon: AlertTriangle, color: expiringNext30 > 0 ? 'text-red-500' : 'text-gray-400' },
          ].map(k => (
            <div key={k.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{k.label}</span>
                <k.icon size={16} className={k.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Category breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assets by category</h2>
            {categoryData.length > 0 ? (
              <div className="flex gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                      {categoryData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 justify-center flex flex-col">
                  {categoryData.map((d: any) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-gray-500 flex-1 truncate">{d.name}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.value}</span>
                      <span className="text-[10px] text-gray-400">{Math.round(d.value/totalAssets*100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-10">No data yet</p>}
          </div>

          {/* Status breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assets by status</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Assets" radius={[6,6,0,0]}>
                    {statusData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No data yet</p>}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Expiry timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Expiry outlook</h2>
            <div className="space-y-3">
              {[
                { label: 'Expiring in 30 days',  value: expiringNext30, color: 'bg-red-500',    max: expiringNext90 || 1 },
                { label: 'Expiring in 90 days',  value: expiringNext90, color: 'bg-amber-400',  max: expiringNext90 || 1 },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{row.value} assets</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${row.color}`}
                      style={{ width: `${Math.min(100, Math.round(row.value / row.max * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top locations */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top locations</h2>
            {topLocations.length > 0 ? (
              <div className="space-y-2">
                {topLocations.map((l: any) => (
                  <div key={l.location} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{l.location}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-brand-600 rounded-full" style={{ width: `${Math.round(l._count._all / totalAssets * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-6 text-right">{l._count._all}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-6">Add locations to assets to see this report</p>}
          </div>
        </div>

        {/* Recently added */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recently added</h2>
          <div className="space-y-2">
            {recentlyAdded.map((a: any) => (
              <div key={a.assetTag} className="flex items-center gap-3 py-1">
                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{a.assetTag}</span>
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{a.name}</span>
                <span className="text-xs text-gray-400">{a.category.replace('_',' ')}</span>
                <span className="text-xs text-gray-400">{formatDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
