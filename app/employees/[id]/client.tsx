'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Phone, Building2, MapPin, Calendar, Edit2, Trash2, Save, X, Laptop, FileText, Armchair, Car, Box, ExternalLink } from 'lucide-react'
import { formatDate, daysUntil, getExpiryStatus } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  ON_LEAVE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  RESIGNED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const ASSET_STATUS_STYLES: Record<string, string> = {
  ACTIVE:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  EXPIRED:       'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  MAINTENANCE:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  INACTIVE:      'bg-gray-100 text-gray-500',
}

const CATEGORY_ICONS: Record<string, any> = {
  LAPTOP: Laptop, DESKTOP: Laptop, SERVER: Box, PRINTER: Box,
  NETWORK_DEVICE: Box, MOBILE: Laptop, SOFTWARE_LICENSE: FileText,
  FURNITURE: Armchair, VEHICLE: Car, OTHER: Box,
}

const STATUSES = ['ACTIVE','INACTIVE','ON_LEAVE','RESIGNED']

export function EmployeeDetailClient({ employee, isAdmin }: any) {
  const router  = useRouter()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(employee)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  function update(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError('')
    const res = await fetch(`/api/employees/${employee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError('Failed to save'); setSaving(false); return }
    setEditing(false); setSaving(false); router.refresh()
  }

  async function deleteEmployee() {
    if (!confirm(`Delete ${employee.name}? Their assets will be unassigned.`)) return
    await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
    router.push('/employees')
  }

  const inp = (label: string, key: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {editing
        ? <input type={type} value={form[key] ?? ''} onChange={e => update(key, e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
        : <p className="text-sm text-gray-900 dark:text-white">{employee[key] ?? '—'}</p>
      }
    </div>
  )

  const initials = employee.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <main className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-4">
        <Link href="/employees" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ChevronLeft size={18} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">{employee.name}</h1>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[employee.status]}`}>
              {employee.status.replace('_',' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400">{employee.employeeId}{employee.designation ? ` · ${employee.designation}` : ''}{employee.department ? ` · ${employee.department}` : ''}</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setForm(employee) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <X size={14} /> Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium disabled:opacity-60">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={deleteEmployee}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <div className="mx-6 mt-3 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">{error}</div>}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-4">

          {/* Profile info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact details</h3>
              <div className="grid grid-cols-2 gap-4">
                {inp('Full name',   'name')}
                {inp('Email',      'email',  'email')}
                {inp('Phone',      'phone',  'tel')}
                {inp('Location',   'location')}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Employment details</h3>
              <div className="grid grid-cols-2 gap-4">
                {inp('Department',  'department')}
                {inp('Designation', 'designation')}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Joined date</label>
                  {editing
                    ? <input type="date" value={form.joinedAt ? form.joinedAt.slice(0,10) : ''} onChange={e => update('joinedAt', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                    : <p className="text-sm text-gray-900 dark:text-white">{formatDate(employee.joinedAt)}</p>
                  }
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  {editing
                    ? <select value={form.status} onChange={e => update('status', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    : <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[employee.status]}`}>{employee.status.replace('_',' ')}</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Assigned assets */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Assigned assets
                <span className="ml-2 text-xs font-normal text-gray-400">{employee.assets.length} item{employee.assets.length !== 1 ? 's' : ''}</span>
              </h3>
              <Link href={`/assets?search=${employee.name}`}
                className="text-xs text-brand-600 hover:underline">
                View in assets list
              </Link>
            </div>

            {employee.assets.length === 0 ? (
              <div className="text-center py-8">
                <Box size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No assets assigned yet</p>
                <Link href="/assets/new"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 hover:underline">
                  Add an asset and assign to this employee
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {employee.assets.map((a: any) => {
                  const Icon    = CATEGORY_ICONS[a.category] ?? Box
                  const expiry  = a.licenseExpiry || a.warrantyExpiry || a.insuranceExpiry
                  const days    = daysUntil(expiry)
                  const badge   = getExpiryStatus(days)
                  return (
                    <Link key={a.id} href={`/assets/${a.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.assetTag} · {a.category.replace('_',' ')}{a.serialNumber ? ` · ${a.serialNumber}` : ''}</p>
                      </div>
                      {expiry && badge && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.class}`}>{badge.label}</span>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ASSET_STATUS_STYLES[a.status] ?? ''}`}>
                        {a.status.replace('_',' ')}
                      </span>
                      <ExternalLink size={12} className="text-gray-300 flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
