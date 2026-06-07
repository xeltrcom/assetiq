'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Plus, Laptop, FileText, Armchair, Car, Box, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { formatDate, daysUntil, getExpiryStatus } from '@/lib/utils'
import { useState } from 'react'

const CATEGORY_ICONS: Record<string, any> = {
  LAPTOP: Laptop, DESKTOP: Laptop, SERVER: Box, PRINTER: Box,
  NETWORK_DEVICE: Box, MOBILE: Laptop, SOFTWARE_LICENSE: FileText,
  FURNITURE: Armchair, VEHICLE: Car, OTHER: Box,
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  EXPIRED:       'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  MAINTENANCE:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  INACTIVE:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  RETIRED:       'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
  LOST:          'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const CATEGORIES = [
  { value: '',                 label: 'All types' },
  { value: 'LAPTOP',           label: 'Laptops' },
  { value: 'DESKTOP',          label: 'Desktops' },
  { value: 'SERVER',           label: 'Servers' },
  { value: 'PRINTER',          label: 'Printers' },
  { value: 'SOFTWARE_LICENSE', label: 'Licenses' },
  { value: 'FURNITURE',        label: 'Furniture' },
  { value: 'VEHICLE',          label: 'Vehicles' },
  { value: 'OTHER',            label: 'Other' },
]

export function AssetsClient({ assets, total, page, pages, filters }: any) {
  const router   = useRouter()
  const [search, setSearch] = useState(filters.search ?? '')

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (filters.search)   params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.status)   params.set('status', filters.status)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/assets?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilter('search', search)
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          All assets <span className="text-gray-400 font-normal text-sm ml-1">{total} total</span>
        </h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets…"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1"
          />
        </form>
        <Link
          href="/assets/new"
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} /> Add asset
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => applyFilter('category', c.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              (filters.category ?? '') === c.value
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {['ACTIVE','EXPIRING_SOON','EXPIRED','MAINTENANCE'].map(s => (
            <button
              key={s}
              onClick={() => applyFilter('status', filters.status === s ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filters.status === s
                  ? STATUS_STYLES[s]
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {assets.length === 0 ? (
            <div className="text-center py-20">
              <Box size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No assets found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search or add your first asset</p>
              <Link href="/assets/new" className="inline-flex items-center gap-1.5 mt-4 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-800 transition-colors">
                <Plus size={14} /> Add first asset
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Asset', 'Tag', 'IP / Serial', 'Assigned to', 'Expiry', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3 first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((a: any) => {
                  const Icon      = CATEGORY_ICONS[a.category] ?? Box
                  const expiry    = a.licenseExpiry || a.warrantyExpiry || a.insuranceExpiry
                  const days      = daysUntil(expiry)
                  const expiryBadge = getExpiryStatus(days)

                  return (
                    <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                            <p className="text-xs text-gray-400">{a.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {a.assetTag}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{a.ipAddress ?? '—'}</p>
                        <p className="text-xs text-gray-400">{a.serialNumber ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {a.assignedTo?.name ?? <span className="text-gray-300 dark:text-gray-600">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        {expiry ? (
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(expiry)}</p>
                            {expiryBadge && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${expiryBadge.class}`}>
                                {expiryBadge.label}
                              </span>
                            )}
                          </div>
                        ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status] ?? STATUS_STYLES.INACTIVE}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 pr-5">
                        <Link href={`/assets/${a.id}`} className="text-gray-400 hover:text-brand-600 transition-colors">
                          <ExternalLink size={14} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <Link
                href={`/assets?page=${page - 1}`}
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 ${page === 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronLeft size={14} />
              </Link>
              <Link
                href={`/assets?page=${page + 1}`}
                className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 ${page === pages ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
