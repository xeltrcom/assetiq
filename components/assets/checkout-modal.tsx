'use client'

import { useState, useEffect } from 'react'
import { LogIn, LogOut, Loader2, X, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CheckoutModal({ asset }: { asset: any }) {
  const router  = useRouter()
  const [open,     setOpen]     = useState(false)
  const [action,   setAction]   = useState<'checkout' | 'checkin'>('checkout')
  const [employees,setEmployees]= useState<any[]>([])
  const [empSearch,setEmpSearch]= useState('')
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [notes,    setNotes]    = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const isCheckedOut = !!asset.employeeId

  useEffect(() => {
    if (open && !isCheckedOut) {
      fetch('/api/employees').then(r => r.json()).then(data => setEmployees(Array.isArray(data) ? data : []))
    }
  }, [open])

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.department ?? '').toLowerCase().includes(empSearch.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (action === 'checkout' && !selectedEmp) { setError('Please select an employee'); return }
    setSaving(true); setError('')

    const res = await fetch(`/api/assets/${asset.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        employeeId:         selectedEmp?.id,
        notes,
        expectedReturnDate: returnDate || null,
      }),
    })

    if (!res.ok) { setError('Failed'); setSaving(false); return }
    setSaving(false); setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => { setAction(isCheckedOut ? 'checkin' : 'checkout'); setOpen(true) }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
          isCheckedOut
            ? 'border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        {isCheckedOut ? <><LogIn size={14} /> Check in</> : <><LogOut size={14} /> Check out</>}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {isCheckedOut ? 'Check in asset' : 'Check out asset'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">{error}</div>}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Asset</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                <p className="text-xs text-gray-400 font-mono">{asset.assetTag}</p>
              </div>

              {!isCheckedOut && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Assign to employee *</label>
                  {selectedEmp ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
                        {selectedEmp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedEmp.name}</p>
                        <p className="text-xs text-gray-400">{selectedEmp.department}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedEmp(null)} className="text-xs text-red-500">Remove</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800">
                        <Search size={14} className="text-gray-400" />
                        <input value={empSearch} onChange={e => setEmpSearch(e.target.value)}
                          placeholder="Search employee…"
                          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
                      </div>
                      {empSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                          {filteredEmps.map(emp => (
                            <button key={emp.id} type="button" onClick={() => { setSelectedEmp(emp); setEmpSearch('') }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                              <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-[10px] font-bold text-brand-700">
                                {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                                <p className="text-xs text-gray-400">{emp.department}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isCheckedOut && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expected return date</label>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder={isCheckedOut ? 'Condition on return, any issues…' : 'Purpose, condition notes…'}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-60 ${
                    isCheckedOut ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-600 hover:bg-brand-800'
                  }`}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Processing…</> : isCheckedOut ? 'Check in' : 'Check out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
