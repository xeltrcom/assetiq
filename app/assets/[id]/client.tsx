'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Laptop, FileText, Armchair, Car, Box, Edit2, Trash2,
  Save, X, ChevronLeft, User, MapPin, Calendar, DollarSign,
  Cpu, HardDrive, Battery, Wifi, Monitor, Hash, Shield,
  AlertTriangle, CheckCircle, Clock, Wrench
} from 'lucide-react'
import { formatDate, daysUntil, getExpiryStatus, formatCurrency } from '@/lib/utils'
import { QRModal } from '@/components/assets/qr-modal'

const CATEGORY_ICONS: Record<string, any> = {
  LAPTOP: Laptop, DESKTOP: Monitor, SERVER: Box, PRINTER: Box,
  NETWORK_DEVICE: Wifi, MOBILE: Laptop, SOFTWARE_LICENSE: FileText,
  FURNITURE: Armchair, VEHICLE: Car, OTHER: Box,
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  EXPIRED:       'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  MAINTENANCE:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  INACTIVE:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  RETIRED:       'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
}

const STATUSES = ['ACTIVE','INACTIVE','MAINTENANCE','RETIRED','LOST']

export function AssetDetailClient({ asset, users, isAdmin }: any) {
  const router  = useRouter()
  const [tab,     setTab]     = useState<'overview'|'specs'|'financial'|'history'>('overview')
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(asset)
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)
  const [error,   setError]   = useState('')

  const Icon = CATEGORY_ICONS[asset.category] ?? Box

  function update(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true); setError('')
    const res = await fetch(`/api/assets/${asset.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    if (!res.ok) { setError('Failed to save'); setSaving(false); return }
    setEditing(false); setSaving(false); router.refresh()
  }

  async function deleteAsset() {
    if (!confirm('Delete this asset? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' })
    router.push('/assets')
  }

  const inp = (label: string, key: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {editing ? (
        <input
          type={type} value={form[key] ?? ''}
          onChange={e => update(key, e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
        />
      ) : (
        <p className="text-sm text-gray-900 dark:text-white">{asset[key] ?? '—'}</p>
      )}
    </div>
  )

  const dateField = (label: string, key: string) => {
    const days  = daysUntil(asset[key])
    const badge = getExpiryStatus(days)
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        {editing ? (
          <input type="date" value={form[key] ? form[key].slice(0,10) : ''}
            onChange={e => update(key, e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
          />
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 dark:text-white">{formatDate(asset[key])}</p>
            {badge && <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.class}`}>{badge.label}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-4">
        <Link href="/assets" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
          <Icon size={18} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">{asset.name}</h1>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[asset.status] ?? STATUS_STYLES.INACTIVE}`}>
              {asset.status.replace('_',' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400">{asset.assetTag} · {asset.category.replace('_',' ')}</p>
        </div>

        {/* AI tags */}
        {asset.aiTags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {asset.aiTags.map((tag: string) => (
              <span key={tag} className="text-[10px] bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                {tag}
              </span>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setForm(asset) }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <X size={14} /> Cancel
                </button>
                <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium disabled:opacity-60">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
                </button>
              </>
            ) : (
              <>
                <QRModal assetId={asset.id} assetTag={asset.assetTag} assetName={asset.name} />
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={deleteAsset} disabled={deleting} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-60">
                  <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && <div className="mx-6 mt-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 border border-red-200">{error}</div>}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex gap-1">
        {(['overview','specs','financial','history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-4">

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                {/* Assignment */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={14} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assigned to</h3>
                  </div>
                  {editing ? (
                    <select value={form.assignedToId ?? ''} onChange={e => update('assignedToId', e.target.value || null)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                      <option value="">Unassigned</option>
                      {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{asset.assignedTo?.name ?? 'Unassigned'}</p>
                      {asset.assignedTo?.email && <p className="text-xs text-gray-400">{asset.assignedTo.email}</p>}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Location</h3>
                  </div>
                  {inp('', 'location')}
                </div>

                {/* Status */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={14} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Status</h3>
                  </div>
                  {editing ? (
                    <select value={form.status} onChange={e => update('status', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[asset.status]}`}>
                      {asset.status.replace('_',' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Expiry dates */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Expiry & warranty</h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {dateField('Warranty expiry',   'warrantyExpiry')}
                  {dateField('License expiry',    'licenseExpiry')}
                  {dateField('Insurance expiry',  'insuranceExpiry')}
                  {dateField('Maintenance due',   'maintenanceDue')}
                </div>
              </div>

              {/* Description + notes */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                {editing ? (
                  <textarea value={form.description ?? ''} onChange={e => update('description', e.target.value)}
                    rows={3} placeholder="Add notes about this asset…"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                  />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{asset.description ?? 'No notes added.'}</p>
                )}
              </div>
            </>
          )}

          {/* SPECS TAB */}
          {tab === 'specs' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Device specifications</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Hash size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Brand', 'brand')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Hash size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Model', 'model')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Hash size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Serial number', 'serialNumber')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Wifi size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('IP address', 'ipAddress')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Wifi size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('MAC address', 'macAddress')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Monitor size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Hostname', 'hostname')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Monitor size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Operating system', 'os')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Monitor size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('OS version', 'osVersion')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Cpu size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Processor', 'processor')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <HardDrive size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('RAM (GB)', 'ramGb', 'number')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <HardDrive size={13} className="text-gray-500" />
                  </div>
                  <div className="flex-1">{inp('Storage (GB)', 'storageGb', 'number')}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Battery size={13} className={asset.batteryHealth < 50 ? 'text-red-500' : asset.batteryHealth < 70 ? 'text-amber-500' : 'text-green-500'} />
                  </div>
                  <div className="flex-1">
                    {inp('Battery health %', 'batteryHealth', 'number')}
                    {!editing && asset.batteryHealth && (
                      <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                        <div
                          className={`h-1.5 rounded-full ${asset.batteryHealth < 50 ? 'bg-red-500' : asset.batteryHealth < 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                          style={{ width: `${asset.batteryHealth}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINANCIAL TAB */}
          {tab === 'financial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Purchase date',       key: 'purchaseDate',     type: 'date' },
                  { label: 'Purchase price',       key: 'purchasePrice',   type: 'number' },
                  { label: 'Current value',        key: 'currentValue',    type: 'number' },
                  { label: 'Depreciation rate %',  key: 'depreciationRate',type: 'number' },
                ].map(f => (
                  <div key={f.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    {f.type === 'date' ? dateField(f.label, f.key) : inp(f.label, f.key, f.type)}
                  </div>
                ))}
              </div>
              {asset.purchasePrice && asset.currentValue && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Depreciation</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-brand-600 rounded-full"
                        style={{ width: `${Math.round((asset.currentValue / asset.purchasePrice) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((asset.currentValue / asset.purchasePrice) * 100)}% remaining value
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹{asset.currentValue?.toLocaleString()} current</span>
                    <span>₹{asset.purchasePrice?.toLocaleString()} original</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === 'history' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Audit history</h3>
              {asset.auditLogs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {asset.auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-brand-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                        {log.notes && <p className="text-xs text-gray-500 mt-0.5">{log.notes}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {log.user?.name ?? 'System'} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
