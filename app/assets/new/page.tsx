'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import {
  Laptop, FileText, Armchair, Car, Box, ChevronDown, ChevronUp,
  Sparkles, Loader2, Search, User, Upload, X, File, Plus, Trash2
} from 'lucide-react'

const DEFAULT_CATEGORIES = [
  { value: 'LAPTOP',           label: 'Laptop',           icon: 'Laptop' },
  { value: 'DESKTOP',          label: 'Desktop',          icon: 'Laptop' },
  { value: 'SERVER',           label: 'Server',           icon: 'Box' },
  { value: 'PRINTER',          label: 'Printer',          icon: 'Box' },
  { value: 'NETWORK_DEVICE',   label: 'Network Device',   icon: 'Box' },
  { value: 'MOBILE',           label: 'Mobile',           icon: 'Box' },
  { value: 'SOFTWARE_LICENSE', label: 'Software License', icon: 'FileText' },
  { value: 'FURNITURE',        label: 'Furniture',        icon: 'Armchair' },
  { value: 'VEHICLE',          label: 'Vehicle',          icon: 'Car' },
  { value: 'OTHER',            label: 'Other',            icon: 'Box' },
]

const ICON_MAP: Record<string, any> = { Laptop, FileText, Armchair, Car, Box }

const isDevice  = (c: string) => ['LAPTOP','DESKTOP','SERVER','PRINTER','NETWORK_DEVICE','MOBILE'].includes(c)
const isLicense = (c: string) => c === 'SOFTWARE_LICENSE'
const isVehicle = (c: string) => c === 'VEHICLE'

const DOC_TYPES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'WARRANTY', label: 'Warranty' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'IMAGE', label: 'Photo' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'OTHER', label: 'Other' },
]

export default function NewAssetPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Record<string, any>>({
    name: '', category: 'LAPTOP', description: '',
    brand: '', model: '', serialNumber: '', ipAddress: '',
    macAddress: '', hostname: '', os: '', osVersion: '',
    processor: '', ramGb: '', storageGb: '', batteryHealth: '',
    licenseKey: '', licenseSeats: '', vendor: '',
    vehicleReg: '', purchaseDate: '', purchasePrice: '',
    currentValue: '', depreciationRate: '', warrantyExpiry: '',
    licenseExpiry: '', insuranceExpiry: '', maintenanceDue: '',
    location: '', employeeId: '',
  })

  const [loading,      setLoading]      = useState(false)
  const [aiLoading,    setAiLoading]    = useState(false)
  const [error,        setError]        = useState('')
  const [showFinancial,setShowFinancial]= useState(false)
  const [showDevice,   setShowDevice]   = useState(true)
  const [employees,    setEmployees]    = useState<any[]>([])
  const [empSearch,    setEmpSearch]    = useState('')
  const [empOpen,      setEmpOpen]      = useState(false)
  const [selectedEmp,  setSelectedEmp]  = useState<any>(null)
  const [categories,   setCategories]   = useState(DEFAULT_CATEGORIES)
  const [newCatName,   setNewCatName]   = useState('')
  const [showAddCat,   setShowAddCat]   = useState(false)
  const [pendingDocs,  setPendingDocs]  = useState<{ file: File; type: string; name: string }[]>([])
  const [docType,      setDocType]      = useState('OTHER')
  const [uploadingDocs,setUploadingDocs]= useState(false)

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {})
    // Load custom categories from localStorage
    const saved = localStorage.getItem('assetiq-categories')
    if (saved) {
      const custom = JSON.parse(saved)
      setCategories([...DEFAULT_CATEGORIES, ...custom])
    }
  }, [])

  function addCustomCategory() {
    if (!newCatName.trim()) return
    const value = newCatName.toUpperCase().replace(/\s+/g, '_')
    const newCat = { value, label: newCatName, icon: 'Box' }
    const updated = [...categories, newCat]
    setCategories(updated)
    // Save custom ones to localStorage
    const custom = updated.filter(c => !DEFAULT_CATEGORIES.find(d => d.value === c.value))
    localStorage.setItem('assetiq-categories', JSON.stringify(custom))
    setNewCatName('')
    setShowAddCat(false)
    setForm(f => ({ ...f, category: value }))
  }

  function removeCategory(value: string) {
    if (DEFAULT_CATEGORIES.find(c => c.value === value)) return // can't remove defaults
    const updated = categories.filter(c => c.value !== value)
    setCategories(updated)
    const custom = updated.filter(c => !DEFAULT_CATEGORIES.find(d => d.value === c.value))
    localStorage.setItem('assetiq-categories', JSON.stringify(custom))
    if (form.category === value) setForm(f => ({ ...f, category: 'OTHER' }))
  }

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.email ?? '').toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.department ?? '').toLowerCase().includes(empSearch.toLowerCase())
  )

  function selectEmployee(emp: any) {
    setSelectedEmp(emp)
    setForm(f => ({ ...f, employeeId: emp.id }))
    setEmpOpen(false); setEmpSearch('')
  }

  function update(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingDocs(d => [...d, { file, type: docType, name: file.name }])
    e.target.value = ''
  }

  function removeDoc(idx: number) {
    setPendingDocs(d => d.filter((_, i) => i !== idx))
  }

  async function autoFillFromIp() {
    if (!form.ipAddress) return
    setAiLoading(true)
    try {
      const res  = await fetch(`/api/discovery/lookup?ip=${form.ipAddress}`)
      const data = await res.json()
      if (data) setForm(f => ({
        ...f,
        hostname: data.hostname || f.hostname,
        macAddress: data.mac || f.macAddress,
        os: data.os || f.os,
        brand: data.vendor || f.brand,
      }))
    } catch {}
    setAiLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const payload: any = { ...form }
    ;['ramGb','storageGb','batteryHealth','licenseSeats','purchasePrice','currentValue','depreciationRate']
      .forEach(k => { if (payload[k] !== '') payload[k] = Number(payload[k]); else delete payload[k] })
    Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k] })

    const res = await fetch('/api/assets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to create asset')
      setLoading(false); return
    }

    const asset = await res.json()

    // Upload pending documents
    if (pendingDocs.length > 0) {
      setUploadingDocs(true)
      for (const doc of pendingDocs) {
        const fd = new FormData()
        fd.append('file', doc.file)
        fd.append('type', doc.type)
        fd.append('name', doc.name)
        await fetch(`/api/assets/${asset.id}/documents`, { method: 'POST', body: fd }).catch(() => {})
      }
      setUploadingDocs(false)
    }

    router.push('/assets')
  }

  const inp = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} value={form[key] ?? ''} placeholder={placeholder}
        onChange={e => update(key, e.target.value)}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600" />
    </div>
  )

  const Section = ({ title, open, setOpen, children }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        {title}
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">{children}</div>}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Add new asset</h1>
            <p className="text-xs text-gray-500">AI will auto-tag on save</p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">{error}</div>}

          {/* Asset type */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Asset type</h2>
              <button type="button" onClick={() => setShowAddCat(!showAddCat)}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
                <Plus size={12} /> Add custom type
              </button>
            </div>

            {showAddCat && (
              <div className="flex gap-2 mb-3">
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Monitor, Headphones, Keyboard"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                <button type="button" onClick={addCustomCategory}
                  className="bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-lg">Add</button>
                <button type="button" onClick={() => setShowAddCat(false)}
                  className="text-gray-400 hover:text-gray-600 px-2"><X size={16} /></button>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {categories.map(c => {
                const Icon   = ICON_MAP[c.icon] ?? Box
                const active = form.category === c.value
                const isCustom = !DEFAULT_CATEGORIES.find(d => d.value === c.value)
                return (
                  <div key={c.value} className="relative group">
                    <button type="button" onClick={() => update('category', c.value)}
                      className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-brand-50 border-brand-600 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <Icon size={18} />
                      <span className="truncate w-full text-center">{c.label}</span>
                    </button>
                    {isCustom && (
                      <button type="button" onClick={() => removeCategory(c.value)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center">
                        <X size={9} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Basic information</h2>
            <div className="grid grid-cols-2 gap-4">
              {inp('Asset name *', 'name', 'text', 'e.g. Dell XPS 15')}
              {inp('Description', 'description', 'text', 'Short description')}
              {inp('Location', 'location', 'text', 'e.g. Floor 2, Desk 14')}
              {inp('Vendor / Supplier', 'vendor', 'text', 'e.g. Dell, Microsoft')}
            </div>
          </div>

          {/* Assign to employee */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assign to employee</h2>
            {selectedEmp ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                  {selectedEmp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.name}</p>
                  <p className="text-xs text-gray-400">{selectedEmp.department}</p>
                </div>
                <button type="button" onClick={() => { setSelectedEmp(null); setForm(f => ({ ...f, employeeId: '' })) }}
                  className="text-xs text-red-500 font-medium">Remove</button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 cursor-text"
                  onClick={() => setEmpOpen(true)}>
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input value={empSearch} onChange={e => { setEmpSearch(e.target.value); setEmpOpen(true) }}
                    onFocus={() => setEmpOpen(true)} placeholder="Search employee by name, department…"
                    className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none" />
                </div>
                {empOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setEmpOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                      {filteredEmps.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No employees found</p>
                      ) : filteredEmps.map(emp => (
                        <button key={emp.id} type="button" onClick={() => selectEmployee(emp)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                            {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-gray-400">{[emp.designation, emp.department].filter(Boolean).join(' · ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Device details — collapsible */}
          {isDevice(form.category) && (
            <Section title="Device details" open={showDevice} setOpen={setShowDevice}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">Fill in manually or use auto-fill from IP</p>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Enter IP to auto-fill" value={form.ipAddress}
                    onChange={e => update('ipAddress', e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 w-44" />
                  <button type="button" onClick={autoFillFromIp} disabled={aiLoading}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60">
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Auto-fill
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {inp('Brand', 'brand', 'text', 'e.g. Dell, HP')}
                {inp('Model', 'model', 'text', 'e.g. XPS 15 9500')}
                {inp('Serial number', 'serialNumber', 'text', 'e.g. 5CG1234ABC')}
                {inp('Hostname', 'hostname', 'text', 'e.g. DESKTOP-ARUN01')}
                {inp('MAC address', 'macAddress', 'text', 'e.g. 00:1A:2B:3C:4D:5E')}
                {inp('Operating system', 'os', 'text', 'e.g. Windows 11')}
                {inp('OS version', 'osVersion', 'text', 'e.g. 23H2')}
                {inp('Processor', 'processor', 'text', 'e.g. Intel i7-12700H')}
                {inp('RAM (GB)', 'ramGb', 'number', 'e.g. 16')}
                {inp('Storage (GB)', 'storageGb', 'number', 'e.g. 512')}
                {inp('Battery health %', 'batteryHealth', 'number', 'e.g. 87')}
              </div>
            </Section>
          )}

          {/* License fields */}
          {isLicense(form.category) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">License details</h2>
              <div className="grid grid-cols-2 gap-4">
                {inp('License key', 'licenseKey', 'text', 'XXXX-XXXX-XXXX-XXXX')}
                {inp('Total seats', 'licenseSeats', 'number', 'e.g. 10')}
                {inp('License expiry', 'licenseExpiry', 'date')}
              </div>
            </div>
          )}

          {/* Vehicle fields */}
          {isVehicle(form.category) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vehicle details</h2>
              <div className="grid grid-cols-2 gap-4">
                {inp('Registration number', 'vehicleReg', 'text', 'e.g. KL-10-AB-1234')}
                {inp('Make', 'brand', 'text', 'e.g. Toyota')}
                {inp('Model', 'model', 'text', 'e.g. Innova')}
                {inp('Insurance expiry', 'insuranceExpiry', 'date')}
              </div>
            </div>
          )}

          {/* Financial — collapsible */}
          <Section title="Financial & expiry dates" open={showFinancial} setOpen={setShowFinancial}>
            <div className="grid grid-cols-2 gap-4">
              {inp('Purchase date', 'purchaseDate', 'date')}
              {inp('Purchase price (₹)', 'purchasePrice', 'number', 'e.g. 85000')}
              {inp('Current value (₹)', 'currentValue', 'number', 'e.g. 60000')}
              {inp('Depreciation rate %', 'depreciationRate', 'number', 'e.g. 20')}
              {inp('Warranty expiry', 'warrantyExpiry', 'date')}
              {inp('Maintenance due', 'maintenanceDue', 'date')}
            </div>
          </Section>

          {/* Documents — collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Attach documents
                {pendingDocs.length > 0 && <span className="ml-2 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingDocs.length}</span>}
              </h2>
              <p className="text-xs text-gray-400">Invoices, warranties, manuals etc.</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                  <Upload size={14} /> Click to attach file
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileAdd}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />
              </div>

              {pendingDocs.length > 0 && (
                <div className="space-y-2">
                  {pendingDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <File size={14} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-400">{doc.type} · {(doc.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removeDoc(i)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-6">
            <button type="submit" disabled={loading || uploadingDocs || !form.name}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-800 text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</>
               : uploadingDocs ? <><Loader2 size={14} className="animate-spin" />Uploading docs…</>
               : 'Save asset'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <p className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <Sparkles size={12} /> AI will auto-tag on save
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
