'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const SEVERITY_CONFIG: Record<string, any> = {
  CRITICAL: { icon: AlertCircle,   bg: 'bg-red-50 dark:bg-red-950/30',    border: 'border-red-200 dark:border-red-900',    dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-400' },
  WARNING:  { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-400',  text: 'text-amber-700 dark:text-amber-400' },
  INFO:     { icon: Info,          bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-900',   dot: 'bg-blue-400',   text: 'text-blue-700 dark:text-blue-400' },
}

export function AlertsClient({ notifications, unreadCount, userId }: any) {
  const router  = useRouter()
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState<'ALL'|'UNREAD'|'CRITICAL'|'WARNING'|'INFO'>('ALL')

  async function markAllRead() {
    await fetch('/api/notifications/mark-read', { method: 'POST' })
    setItems((i: any[]) => i.map(n => ({ ...n, read: true })))
    router.refresh()
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setItems((i: any[]) => i.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const filtered = items.filter((n: any) => {
    if (filter === 'UNREAD')   return !n.read
    if (filter === 'CRITICAL') return n.severity === 'CRITICAL'
    if (filter === 'WARNING')  return n.severity === 'WARNING'
    if (filter === 'INFO')     return n.severity === 'INFO'
    return true
  })

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Smart alerts</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-2 flex gap-2">
        {(['ALL','UNREAD','CRITICAL','WARNING','INFO'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No alerts</p>
            <p className="text-xs text-gray-400 mt-1">Everything looks good!</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {filtered.map((n: any) => {
              const cfg  = SEVERITY_CONFIG[n.severity] ?? SEVERITY_CONFIG.INFO
              const Icon = cfg.icon
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${cfg.bg} ${cfg.border} ${!n.read ? 'shadow-sm' : 'opacity-70'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/50' : n.severity === 'WARNING' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                    <Icon size={15} className={cfg.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    {n.asset && (
                      <Link
                        href={`/assets/${n.asset.id}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-brand-600 hover:underline"
                      >
                        {n.asset.name} · {n.asset.assetTag}
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
