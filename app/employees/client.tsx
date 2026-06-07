'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Plus, Users, Mail, Phone, Building2, Loader2, X } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  ON_LEAVE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  RESIGNED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export function EmployeesClient({ employees, departments, filters }: any) {
  const router = useRouter()
  const [search, setSearch] = useState(filters.search ?? '')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', designation: '', location: '', joinedAt: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filters.department) params.set('department', filters.department)
    router.push(`/employees?${params.toString()}`)
  }

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) return
    setSaving(true); setError('')
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
    setSaving(false); setShowAdd(false)
    setForm({ name: '', email: '', phone: '', department: '', designation: '', location: '', joinedAt: '' })
    router.refresh()
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
          Employees <span className="text-gray-400 font-normal text-sm ml-1">{employees.length} total</span>
        </h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1" />
        </form>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
          <Plus size={14} /> Add employee
        </button>
      </div>

      {/* Department filters */}
      {departments.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-2 flex gap-2 overflow-x-auto">
          <button onClick={() => router.push('/employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filters.department ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            All departments
          </button>
          {departments.map((d: string) => (
            <button key={d} onClick={() => router.push(`/employees?department=${d}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filters.department === d ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {employees.length === 0 ? (
          <div className="text-center py-20">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No employees yet</p>
            <p className="text-xs text-gray-400 mt-1">Add employees to assign assets to them</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-800 transition-colors">
              <Plus size={14} /> Add first employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {employees.map((emp: any) => (
              <Link key={emp.id} href={`/employees/${emp.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[emp.status]}`}>
                    {emp.status.replace('_',' ')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{emp.designation ?? emp.department ?? '—'}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                  {emp.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={11} />{emp.email}</div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={11} />{emp.phone}</div>
                  )}
                  {emp.department && (
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Building2 size={11} />{emp.department}</div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-medium text-brand-600">
                    {emp._count.assets} asset{emp._count.assets !== 1 ? 's' : ''} assigned
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add employee modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add employee</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addEmployee} className="p-5 space-y-4">
              {error && <div className="bg-red-50 dark:bg-red-950 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                {inp('Full name *',   'name',        'text', 'e.g. Arun G')}
                {inp('Email',        'email',       'email','arun@company.com')}
                {inp('Phone',        'phone',       'tel',  '+91 9876543210')}
                {inp('Department',   'department',  'text', 'e.g. Engineering')}
                {inp('Designation',  'designation', 'text', 'e.g. Software Engineer')}
                {inp('Location',     'location',    'text', 'e.g. Floor 2')}
                {inp('Joined date',  'joinedAt',    'date')}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !form.name}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Add employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
