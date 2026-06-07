'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Building2, Mail, Phone, Globe, Trash2 } from 'lucide-react'

export function VendorsClient({ vendors: initial }: any) {
  const router  = useRouter()
  const [vendors,  setVendors]  = useState(initial)
  const [showAdd,  setShowAdd]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form,     setForm]     = useState({
    name: '', contactPerson: '', phone: '', email: '',
    address: '', website: '', category: '', notes: '',
  })

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function addVendor(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/vendors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setVendors((v: any[]) => [...v, data])
      setShowAdd(false)
      setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', website: '', category: '', notes: '' })
    }
    setSaving(false)
  }

  async function deleteVendor(id: string) {
    if (!confirm('Delete this vendor?')) return
    setDeleting(id)
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' })
    setVendors((v: any[]) => v.filter(x => x.id !== id))
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
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          Vendors <span className="text-gray-400 font-normal text-sm ml-1">{vendors.length} total</span>
        </h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
          <Plus size={14} /> Add vendor
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {vendors.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No vendors yet</p>
            <p className="text-xs text-gray-400 mt-1">Add vendors to track suppliers and service providers</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-800 transition-colors">
              <Plus size={14} /> Add first vendor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {vendors.map((v: any) => (
              <div key={v.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    {v.name.slice(0,2).toUpperCase()}
                  </div>
                  <button onClick={() => deleteVendor(v.id)} disabled={deleting === v.id}
                    className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{v.name}</p>
                {v.category && <p className="text-xs text-gray-400 mt-0.5">{v.category}</p>}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  {v.contactPerson && <p className="text-xs text-gray-500">{v.contactPerson}</p>}
                  {v.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={11} />
                      <a href={`mailto:${v.email}`} className="hover:text-brand-600 truncate">{v.email}</a>
                    </div>
                  )}
                  {v.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={11} />{v.phone}
                    </div>
                  )}
                  {v.website && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Globe size={11} />
                      <a href={v.website} target="_blank" className="hover:text-brand-600 truncate">{v.website.replace('https://','')}</a>
                    </div>
                  )}
                </div>
                {v.vendorCode && <p className="text-[10px] text-gray-300 mt-2 font-mono">{v.vendorCode}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add vendor</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={addVendor} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {inp('Vendor name *',   'name',          'text', 'e.g. Dell Technologies')}
                {inp('Category',        'category',      'text', 'e.g. Hardware, Software')}
                {inp('Contact person',  'contactPerson', 'text', 'e.g. John Smith')}
                {inp('Phone',           'phone',         'tel',  '+91 9876543210')}
                {inp('Email',           'email',         'email','vendor@company.com')}
                {inp('Website',         'website',       'url',  'https://vendor.com')}
                <div className="col-span-2">
                  {inp('Address', 'address', 'text', 'Full address')}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.name}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Add vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
