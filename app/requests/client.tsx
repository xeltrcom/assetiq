'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, CheckCircle, XCircle, Clock, Package, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_CONFIG: Record<string, any> = {
  PENDING:              { label: 'Pending',          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',    dot: 'bg-amber-400' },
  APPROVED_BY_MANAGER:  { label: 'Manager Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',        dot: 'bg-blue-400' },
  APPROVED:             { label: 'Approved',          color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',    dot: 'bg-green-500' },
  REJECTED:             { label: 'Rejected',          color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',            dot: 'bg-red-500' },
  FULFILLED:            { label: 'Fulfilled',         color: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',   dot: 'bg-brand-600' },
  CANCELLED:            { label: 'Cancelled',         color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',          dot: 'bg-gray-400' },
}

const URGENCY_CONFIG: Record<string, string> = {
  LOW:      'bg-gray-100 text-gray-600',
  NORMAL:   'bg-blue-100 text-blue-700',
  HIGH:     'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const REQUEST_TYPES = [
  { value: 'NEW_ASSET',          label: 'New asset request' },
  { value: 'ASSET_UPGRADE',      label: 'Asset upgrade' },
  { value: 'ASSET_REPLACEMENT',  label: 'Asset replacement' },
  { value: 'ADDITIONAL_ASSET',   label: 'Additional asset' },
  { value: 'ASSET_RETURN',       label: 'Asset return' },
]

const ASSET_CATEGORIES = ['LAPTOP','DESKTOP','MOBILE','PRINTER','SOFTWARE_LICENSE','FURNITURE','VEHICLE','OTHER']

export function RequestsClient({ requests, counts, isAdmin, currentFilter }: any) {
  const router  = useRouter()
  const [showAdd,   setShowAdd]   = useState(false)
  const [form,      setForm]      = useState({ type: 'NEW_ASSET', title: '', description: '', urgency: 'NORMAL', assetCategory: '', quantity: '1' })
  const [saving,    setSaving]    = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [expandedId,setExpandedId]= useState<string | null>(null)
  const [note,      setNote]      = useState('')

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  const countMap = counts.reduce((a: any, c: any) => ({ ...a, [c.status]: c._count._all }), {})
  const total    = requests.length

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
    })
    setSaving(false); setShowAdd(false)
    setForm({ type: 'NEW_ASSET', title: '', description: '', urgency: 'NORMAL', assetCategory: '', quantity: '1' })
    router.refresh()
  }

  async function action(id: string, act: string) {
    setActioning(id + act)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act, note }),
    })
    setActioning(null); setNote(''); setExpandedId(null)
    router.refresh()
  }

  const filtered = currentFilter === 'ALL' ? requests : requests.filter((r: any) => r.status === currentFilter)

  const FILTERS = [
    { key: 'ALL',      label: 'All',       count: total },
    { key: 'PENDING',  label: 'Pending',   count: countMap.PENDING  ?? 0 },
    { key: 'APPROVED', label: 'Approved',  count: countMap.APPROVED ?? 0 },
    { key: 'REJECTED', label: 'Rejected',  count: countMap.REJECTED ?? 0 },
    { key: 'FULFILLED',label: 'Fulfilled', count: countMap.FULFILLED ?? 0 },
  ]

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          Asset requests
          {countMap.PENDING > 0 && isAdmin && (
            <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{countMap.PENDING}</span>
          )}
        </h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
          <Plus size={14} /> New request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-2 flex gap-2">
        {FILTERS.map(f => (
          <button key={f.key}
            onClick={() => router.push(f.key === 'ALL' ? '/requests' : `/requests?status=${f.key}`)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              currentFilter === f.key || (f.key === 'ALL' && currentFilter === 'ALL')
                ? 'bg-brand-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            {f.label}
            {f.count > 0 && <span className="bg-white/30 px-1.5 rounded-full text-[10px]">{f.count}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No requests yet</p>
            <p className="text-xs text-gray-400 mt-1">Submit a request when you need a new or replacement asset</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-800 transition-colors">
              <Plus size={14} /> Submit first request
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {filtered.map((r: any) => {
              const cfg     = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING
              const isOpen  = expandedId === r.id
              return (
                <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="p-4 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.requestNumber} · {REQUEST_TYPES.find(t => t.value === r.type)?.label ?? r.type}
                            {r.assetCategory ? ` · ${r.assetCategory.replace('_',' ')}` : ''}
                            {r.quantity > 1 ? ` · Qty: ${r.quantity}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${URGENCY_CONFIG[r.urgency] ?? ''}`}>{r.urgency}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </div>
                      {r.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{r.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-gray-400">
                          by <span className="font-medium text-gray-600 dark:text-gray-300">{r.requestedBy?.name}</span>
                          {' · '}{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                        </p>
                        {r.adminNote && (
                          <p className="text-xs text-gray-400 italic">Note: {r.adminNote}</p>
                        )}
                      </div>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && r.status === 'PENDING' && (
                      <button onClick={() => setExpandedId(isOpen ? null : r.id)}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium flex-shrink-0">
                        Actions <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                    {isAdmin && r.status === 'APPROVED' && (
                      <button onClick={() => action(r.id, 'fulfil')} disabled={actioning === r.id + 'fulfil'}
                        className="flex items-center gap-1 text-xs bg-brand-600 hover:bg-brand-800 text-white px-2.5 py-1.5 rounded-lg font-medium flex-shrink-0">
                        {actioning === r.id + 'fulfil' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Mark fulfilled
                      </button>
                    )}
                  </div>

                  {/* Expand panel for admin actions */}
                  {isOpen && isAdmin && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                      <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)…" rows={2}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none mb-3" />
                      <div className="flex gap-2">
                        <button onClick={() => action(r.id, 'approve')} disabled={!!actioning}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                          {actioning === r.id + 'approve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                        </button>
                        <button onClick={() => action(r.id, 'reject')} disabled={!!actioning}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                          {actioning === r.id + 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
                        </button>
                        <button onClick={() => setExpandedId(null)}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-white dark:hover:bg-gray-800">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New request modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">New asset request</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitRequest} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Request type</label>
                  <select value={form.type} onChange={e => update('type', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                    {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Urgency</label>
                  <select value={form.urgency} onChange={e => update('urgency', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                    {['LOW','NORMAL','HIGH','CRITICAL'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} required
                    placeholder="e.g. Need a laptop for new joiner"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Asset category</label>
                  <select value={form.assetCategory} onChange={e => update('assetCategory', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                    <option value="">Select category</option>
                    {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => update('quantity', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)}
                    rows={3} placeholder="Explain why you need this asset…"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.title}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
