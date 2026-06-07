'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Laptop, FileText, Armchair, Car, Box, ChevronDown, ChevronUp, Sparkles, Loader2, Search, User } from 'lucide-react'

const CATEGORIES = [
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

export default function NewAssetPage() {
  const router = useRouter()
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
  const [loading,     setLoading]     = useState(false)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [error,       setError]       = useState('')
  const [showMore,    setShowMore]    = useState(false)
  const [employees,   setEmployees]   = useState<any[]>([])
  const [empSearch,   setEmpSearch]   = useState('')
  const [empOpen,     setEmpOpen]     = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<any>(null)

  useEffect(() => {
    fetch('/api/employees')
      .then(r => r.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.email ?? '').toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.department ?? '').toLowerCase().includes(empSearch.toLowerCase())
  )

  function selectEmployee(emp: any) {
    setSelectedEmp(emp)
    setForm(f => ({ ...f, employeeId: emp.id }))
    setEmpOpen(false)
    setEmpSearch('')
  }

  function clearEmployee() {
    setSelectedEmp(null)
    setForm(f => ({ ...f, employeeId: '' }))
  }

  function update(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function autoFillFromIp() {
    if (!form.ipAddress) return
    setAiLoading(true)
    try {
      const res  = await fetch(`/api/discovery/lookup?ip=${form.ipAddress}`)
      const data = await res.json()
      if (data) {
        setForm(f => ({
          ...f,
          hostname:   data.hostname  || f.hostname,
          macAddress: data.mac       || f.macAddress,
          os:         data.os        || f.os,
          osVersion:  data.osVersion || f.osVersion,
          brand:      data.vendor    || f.brand,
        }))
      }
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
    router.push('/assets')
  }

  const inp = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} value={form[key] ?? ''} placeholder={placeholder}
        onChange={e => update(key, e.target.value)}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent" />
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Add new asset</h1>
            <p className="text-xs text-gray-500">Fill in the details below — AI will auto-tag it</p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back</button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
          {error && <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 border border-red-200 dark:border-red-800">{error}</div>}

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Asset type</h2>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(c => {
                const Icon   = ICON_MAP[c.icon]
                const active = form.category === c.value
                return (
                  <button key={c.value} type="button" onClick={() => update('category', c.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                      active ? 'bg-brand-50 border-brand-600 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                             : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <Icon size={18} />{c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Basic information</h2>
            <div className="grid grid-cols-2 gap-4">
              {inp('Asset name *',      'name',        'text', 'e.g. Dell XPS 15')}
              {inp('Description',       'description', 'text', 'Short description')}
              {inp('Location',          'location',    'text', 'e.g. Floor 2, Desk 14')}
              {inp('Vendor / Supplier', 'vendor',      'text', 'e.g. Dell, Microsoft')}
            </div>
          </div>

          {/* Assign to employee */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assign to employee</h2>
            {selectedEmp ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300">
                  {selectedEmp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.name}</p>
                  <p className="text-xs text-gray-400">{selectedEmp.designation ?? ''}{selectedEmp.department ? ` · ${selectedEmp.department}` : ''}</p>
                </div>
                <button type="button" onClick={clearEmployee} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 cursor-text"
                  onClick={() => setEmpOpen(true)}>
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input value={empSearch}
                    onChange={e => { setEmpSearch(e.target.value); setEmpOpen(true) }}
                    onFocus={() => setEmpOpen(true)}
                    placeholder="Search employee by name, department…"
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                </div>
                {empOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setEmpOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                      {filteredEmps.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-400">No employees found</p>
                          <a href="/employees" target="_blank" className="text-xs text-brand-600 hover:underline mt-1 block">+ Add employees first</a>
                        </div>
                      ) : filteredEmps.map(emp => (
                        <button key={emp.id} type="button" onClick={() => selectEmployee(emp)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
                            {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-gray-400 truncate">{[emp.designation, emp.department, emp.email].filter(Boolean).join(' · ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Device fields */}
          {isDevice(form.category) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Device details</h2>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Enter IP to auto-fill" value={form.ipAddress}
                    onChange={e => update('ipAddress', e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 w-48" />
                  <button type="button" onClick={autoFillFromIp} disabled={aiLoading}
                    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Auto-fill
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {inp('Brand',            'brand',         'text',   'e.g. Dell, HP, Apple')}
                {inp('Model',            'model',         'text',   'e.g. XPS 15 9500')}
                {inp('Serial number',    'serialNumber',  'text',   'e.g. 5CG1234ABC')}
                {inp('Hostname',         'hostname',      'text',   'e.g. DESKTOP-ARUN01')}
                {inp('MAC address',      'macAddress',    'text',   'e.g. 00:1A:2B:3C:4D:5E')}
                {inp('Operating system', 'os',            'text',   'e.g. Windows 11')}
                {inp('OS version',       'osVersion',     'text',   'e.g. 23H2')}
                {inp('Processor',        'processor',     'text',   'e.g. Intel i7-12700H')}
                {inp('RAM (GB)',          'ramGb',         'number', 'e.g. 16')}
                {inp('Storage (GB)',      'storageGb',     'number', 'e.g. 512')}
                {inp('Battery health %', 'batteryHealth', 'number', 'e.g. 87')}
              </div>
            </div>
          )}

          {/* License fields */}
          {isLicense(form.category) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">License details</h2>
              <div className="grid grid-cols-2 gap-4">
                {inp('License key',    'licenseKey',   'text',   'XXXX-XXXX-XXXX-XXXX')}
                {inp('Total seats',    'licenseSeats', 'number', 'e.g. 10')}
                {inp('License expiry', 'licenseExpiry','date')}
              </div>
            </div>
          )}

          {/* Vehicle fields */}
          {isVehicle(form.category) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vehicle details</h2>
              <div className="grid grid-cols-2 gap-4">
                {inp('Registration number', 'vehicleReg',      'text', 'e.g. KL-10-AB-1234')}
                {inp('Make',                'brand',           'text', 'e.g. Toyota')}
                {inp('Model',               'model',           'text', 'e.g. Innova')}
                {inp('Insurance expiry',    'insuranceExpiry', 'date')}
              </div>
            </div>
          )}

          {/* Financial */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <button type="button" onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
              Financial & expiry dates
              {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showMore && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {inp('Purchase date',       'purchaseDate',    'date')}
                {inp('Purchase price (₹)',  'purchasePrice',   'number', 'e.g. 85000')}
                {inp('Current value (₹)',   'currentValue',    'number', 'e.g. 60000')}
                {inp('Depreciation rate %', 'depreciationRate','number', 'e.g. 20')}
                {inp('Warranty expiry',     'warrantyExpiry',  'date')}
                {inp('Maintenance due',     'maintenanceDue',  'date')}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-6">
            <button type="submit" disabled={loading || !form.name}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-800 text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Save asset'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
            <p className="text-xs text-gray-400 ml-auto flex items-center gap-1"><Sparkles size={12} /> AI will auto-tag this asset on save</p>
          </div>
        </form>
      </main>
    </div>
  )
}
