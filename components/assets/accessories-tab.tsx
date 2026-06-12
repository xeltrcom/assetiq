'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Loader2, Mouse, Keyboard, Monitor, Headphones, Package } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const QUICK_ADD = [
  { name: 'Mouse',      icon: '🖱️' },
  { name: 'Keyboard',   icon: '⌨️' },
  { name: 'Monitor',    icon: '🖥️' },
  { name: 'Headphones', icon: '🎧' },
  { name: 'Webcam',     icon: '📷' },
  { name: 'Docking station', icon: '🔌' },
  { name: 'USB Hub',    icon: '🔗' },
  { name: 'Charger',    icon: '🔋' },
  { name: 'Bag/Case',   icon: '💼' },
]

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  INACTIVE:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  MAINTENANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LOST:        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const emptyForm = {
  name: '', brand: '', model: '', serialNumber: '',
  purchaseDate: '', purchasePrice: '', warrantyExpiry: '', notes: '',
}

export function AccessoriesTab({ assetId }: { assetId: string }) {
  const [accessories, setAccessories] = useState<any[]>([])
  const [loaded,      setLoaded]      = useState(false)
  const [showAdd,     setShowAdd]     = useState(false)
  const [form,        setForm]        = useState({ ...emptyForm })
  const [saving,      setSaving]      = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editForm,    setEditForm]    = useState<any>({})
  const [deleting,    setDeleting]    = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/assets/${assetId}/accessories`)
      .then(r => r.json())
      .then(data => { setAccessories(Array.isArray(data) ? data : []); setLoaded(true) })
  }, [assetId])

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function quickAdd(name: string) {
    setForm(f => ({ ...f, name }))
    setShowAdd(true)
  }

  async function addAccessory(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) return
    setSaving(true)
    const res  = await fetch(`/api/assets/${assetId}/accessories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setAccessories(a => [...a, data])
      setForm({ ...emptyForm })
      setShowAdd(false)
    }
    setSaving(false)
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const res  = await fetch(`/api/assets/${assetId}/accessories/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify(editForm),
    })
    const data = await res.json()
    if (res.ok) {
      setAccessories(a => a.map(x => x.id === id ? data : x))
      setEditingId(null)
    }
    setSaving(false)
  }

  async function deleteAccessory(id: string) {
    if (!confirm('Remove this accessory?')) return
    setDeleting(id)
    await fetch(`/api/assets/${assetId}/accessories/${id}`, { method: 'DELETE' })
    setAccessories(a => a.filter(x => x.id !== id))
    setDeleting(null)
  }

  const inp = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => update(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
    </div>
  )

  return (
    <div className="space-y-4">

      {/* Quick add buttons */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Accessories
            {accessories.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">{accessories.length} item{accessories.length !== 1 ? 's' : ''}</span>}
          </h3>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-800 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={12} /> Add accessory
          </button>
        </div>

        {/* Quick add chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_ADD.map(q => (
            <button key={q.name} type="button" onClick={() => quickAdd(q.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <span>{q.icon}</span>{q.name}
            </button>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={addAccessory} className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 bg-brand-50 dark:bg-brand-900/10 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">New accessory</p>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inp('Name *', 'name', 'text', 'e.g. Mouse, Keyboard')}
              {inp('Brand', 'brand', 'text', 'e.g. Logitech, Dell')}
              {inp('Model', 'model', 'text', 'e.g. MX Master 3')}
              {inp('Serial number', 'serialNumber', 'text', 'e.g. ABC123')}
              {inp('Purchase price (₹)', 'purchasePrice', 'number', 'e.g. 2500')}
              {inp('Warranty expiry', 'warrantyExpiry', 'date')}
            </div>
            <div>
              {inp('Notes', 'notes', 'text', 'Any additional notes')}
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-white dark:hover:bg-gray-800">
                Cancel
              </button>
              <button type="submit" disabled={saving || !form.name}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-60">
                {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : 'Add accessory'}
              </button>
            </div>
          </form>
        )}

        {/* Accessories list */}
        {!loaded ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : accessories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={24} className="mx-auto mb-2" />
            <p className="text-sm">No accessories added yet</p>
            <p className="text-xs mt-1">Click the quick-add buttons above or use "Add accessory"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accessories.map(acc => (
              <div key={acc.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                {editingId === acc.id ? (
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {['name','brand','model','serialNumber'].map(k => (
                        <div key={k}>
                          <label className="block text-[10px] font-medium text-gray-400 mb-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
                          <input value={editForm[k] ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, [k]: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-600" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(acc.id)} disabled={saving}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800">
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-base flex-shrink-0">
                      {QUICK_ADD.find(q => acc.name.toLowerCase().includes(q.name.toLowerCase()))?.icon ?? '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{acc.name}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[acc.status] ?? STATUS_STYLES.ACTIVE}`}>
                          {acc.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[acc.brand, acc.model].filter(Boolean).join(' · ')}
                        {acc.serialNumber && <span className="font-mono"> · {acc.serialNumber}</span>}
                      </p>
                      {(acc.purchasePrice || acc.warrantyExpiry) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {acc.purchasePrice && `₹${acc.purchasePrice.toLocaleString('en-IN')}`}
                          {acc.warrantyExpiry && ` · Warranty: ${formatDate(acc.warrantyExpiry)}`}
                        </p>
                      )}
                      {acc.notes && <p className="text-xs text-gray-400 italic mt-0.5">{acc.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingId(acc.id); setEditForm(acc) }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => deleteAccessory(acc.id)} disabled={deleting === acc.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        {deleting === acc.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
