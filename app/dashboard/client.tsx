'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Box, AlertTriangle, DollarSign, Laptop, Bell, Plus, Search } from 'lucide-react'
import { NotificationBell } from '@/components/layout/topbar'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  LAPTOP:           '#534AB7',
  DESKTOP:          '#1D9E75',
  SERVER:           '#D85A30',
  PRINTER:          '#378ADD',
  SOFTWARE_LICENSE: '#EF9F27',
  VEHICLE:          '#D4537E',
  FURNITURE:        '#888780',
  OTHER:            '#B4B2A9',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  EXPIRED:       'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  MAINTENANCE:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  INACTIVE:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  WARNING:  'bg-amber-400',
  INFO:     'bg-blue-400',
}

export function DashboardClient({ stats, recentAssets, notifications, categoryBreakdown, userName }: any) {
  const chartData = categoryBreakdown.map((c: any) => ({
    name:  c.category.replace('_', ' '),
    value: c._count._all,
    color: CATEGORY_COLORS[c.category] ?? '#B4B2A9',
  }))

  const kpis = [
    { label: 'Total assets',    value: stats.totalAssets.toLocaleString(),       sub: `${stats.activeAssets} active`,      icon: Box,           color: 'text-brand-600' },
    { label: 'Expiring soon',   value: stats.expiringAssets,                     sub: 'within 30 days',                    icon: AlertTriangle, color: 'text-amber-600', warn: stats.expiringAssets > 0 },
    { label: 'Total book value',value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, sub: 'current value',                icon: DollarSign,    color: 'text-green-600' },
    { label: 'Unassigned',      value: stats.unassignedAssets,                   sub: 'needs assignment',                  icon: Laptop,        color: 'text-red-500',   warn: stats.unassignedAssets > 0 },
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Good morning, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-gray-500">Here&apos;s what&apos;s happening with your assets today.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400" />
          <input
            placeholder="Search assets…"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1"
          />
        </div>
        <NotificationBell />
        <Link
          href="/assets/new"
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} /> Add asset
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className={cn(
              'bg-white dark:bg-gray-900 rounded-2xl border p-5',
              k.warn ? 'border-amber-200 dark:border-amber-900' : 'border-gray-200 dark:border-gray-800'
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{k.label}</span>
                <k.icon size={16} className={k.color} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Middle row: recent assets + chart + alerts */}
        <div className="grid grid-cols-3 gap-4">

          {/* Recent assets */}
          <div className="col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent assets</h2>
              <Link href="/assets" className="text-xs text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-1">
              {recentAssets.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Laptop size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {a.assetTag}{a.ipAddress ? ` · ${a.ipAddress}` : ''}{a.assignedTo ? ` · ${a.assignedTo.name}` : ''}
                    </p>
                  </div>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', STATUS_STYLES[a.status] ?? STATUS_STYLES.INACTIVE)}>
                    {a.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Asset breakdown</h2>
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                      {chartData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {chartData.slice(0, 5).map((d: any) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-gray-500 flex-1">{d.name}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center mt-10">No assets yet</p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Smart alerts</h2>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{notifications.length}</span>
              )}
            </div>
            <Link href="/alerts" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No alerts — everything looks good!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {notifications.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', SEVERITY_STYLES[n.severity])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">{n.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
