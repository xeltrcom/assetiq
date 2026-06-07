'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, Loader2, Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { formatDate, daysUntil } from '@/lib/utils'

const STATUS_CONFIG: Record<string, any> = {
  SCHEDULED:  { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',   icon: Clock },
  IN_PROGRESS:{ color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: Wrench },
  COMPLETED:  { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle },
  OVERDUE:    { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',         icon: AlertTriangle },
}

export function MaintenanceClient({ schedules: initial, assets }: any) {
  const router = useRouter()
  const [schedules, setSchedules] = useState(initial)
  const [showAdd,   setShowAdd]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form,      setForm]      = useState({
    assetId: '', title: '', description: '',
    scheduledAt: '', technicianName: '', cost: '',
  })

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  // Mark overdue
  const enriched = schedules.map((s: any) => ({
    ...s,
    effectiveStatus: s.status === 'COMPLETED' ? 'COMPLETED'
      : daysUntil(s.scheduledAt) !== null && (daysUntil(s.scheduledAt) ?? 0) < 0 ? 'OVERDUE'
      : s.status,
  }))

  async function addSchedule(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/maintenance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cost: form.cost ? Number(form.cost) : null }),
    })
    const data = await res.json()
    if (res.ok) {
      setSchedules((s: any[]) => [...s, data])
      setShowAdd(false)
      setForm({ assetId: '', title: '', description: '', scheduledAt: '', technicianName: '', cost: '' })
    }
    setSaving(false)
  }

  async function markComplete(id: string) {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', completedAt: new Date() }),
    })
    setSchedules((s: any[]) => s.map(x => x.id === id ? { ...x, status: 'COMPLETED' } : x))
  }

  const overdue    = enriched.filter((s: any) => s.effectiveStatus === 'OVERDUE').length
  const upcoming   = enriched.filter((s: any) => s.effectiveStatus === 'SCHEDULED').length
  const completed  = enriched.filter((s: any) => s.effectiveStatus === 'COMPLETED').length

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          Maintenance
          {overdue > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{overdue} overdue</span>}
        </h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
          <Plus size={14} /> Schedule maintenance
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Overdue',   value: overdue,   color: 'text-red-500' },
            { label: 'Upcoming',  value: upcoming,  color: 'text-blue-600' },
            { label: 'Completed', value: completed, color: 'text-green-600' },
          ].map(k => (
            <div key={k.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs text-gray-400 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Schedule list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {enriched.length === 0 ? (
            <div className="text-center py-16">
              <Wrench size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No maintenance scheduled</p>
              <button onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-1.5 mt-3 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-800">
                <Plus size={14} /> Schedule first maintenance
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Asset','Task','Scheduled','Technician','Cost','Status',''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((s: any) => {
                  const cfg  = STATUS_CONFIG[s.effectiveStatus] ?? STATUS_CONFIG.SCHEDULED
                  const Icon = cfg.icon
                  return (
                    <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 pl-5">
                        <Link href={`/assets/${s.asset?.id}`} className="text-sm font-medium text-brand-600 hover:underline">{s.asset?.name}</Link>
                        <p className="text-xs text-gray-400 font-mono">{s.asset?.assetTag}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.title}</p>
                        {s.description && <p className="text-xs text-gray-400 truncate max-w-xs">{s.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(s.scheduledAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.technicianName ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.cost ? `₹${s.cost.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <Icon size={10} />{s.effectiveStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 pr-5">
                        {s.effectiveStatus !== 'COMPLETED' && (
                          <button onClick={() => markComplete(s.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium">
                            Mark done
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Schedule maintenance</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={addSchedule} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Asset *</label>
                  <select value={form.assetId} onChange={e => update('assetId', e.target.value)} required
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                    <option value="">Select asset…</option>
                    {assets.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Task title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} required
                    placeholder="e.g. Annual service, Battery replacement"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Scheduled date *</label>
                  <input type="date" value={form.scheduledAt} onChange={e => update('scheduledAt', e.target.value)} required
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estimated cost (₹)</label>
                  <input type="number" value={form.cost} onChange={e => update('cost', e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Technician name</label>
                  <input value={form.technicianName} onChange={e => update('technicianName', e.target.value)}
                    placeholder="e.g. Rajan Kumar"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.assetId || !form.title || !form.scheduledAt}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
