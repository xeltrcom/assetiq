'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, X, CheckCheck, AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const SEVERITY_STYLES: Record<string, any> = {
  CRITICAL: { dot: 'bg-red-500',   icon: AlertCircle,   text: 'text-red-600 dark:text-red-400' },
  WARNING:  { dot: 'bg-amber-400', icon: AlertTriangle, text: 'text-amber-600 dark:text-amber-400' },
  INFO:     { dot: 'bg-blue-400',  icon: Info,          text: 'text-blue-600 dark:text-blue-400' },
}

export function NotificationBell() {
  const router  = useRouter()
  const [open,         setOpen]         = useState(false)
  const [count,        setCount]        = useState(0)
  const [notifications,setNotifications]= useState<any[]>([])
  const [loading,      setLoading]      = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch unread count every 30 seconds
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchCount() {
    const res  = await fetch('/api/notifications/unread-count')
    const data = await res.json()
    setCount(data.count ?? 0)
  }

  async function fetchNotifications() {
    setLoading(true)
    const res  = await fetch('/api/notifications?limit=10')
    const data = await res.json()
    setNotifications(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function markAllRead() {
    await fetch('/api/notifications/mark-read', { method: 'POST' })
    setCount(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setCount(c => Math.max(0, c - 1))
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  }

  function toggleOpen() {
    if (!open) fetchNotifications()
    setOpen(!open)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell size={16} className="text-gray-600 dark:text-gray-400" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {count > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={20} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg  = SEVERITY_STYLES[n.severity] ?? SEVERITY_STYLES.INFO
                const Icon = cfg.icon
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon size={13} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium line-clamp-2 ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2.5">
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              View all alerts <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
