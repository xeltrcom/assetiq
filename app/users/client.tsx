'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Shield, Edit2, Trash2, X, Loader2, Check, UserPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const ROLES = [
  { value: 'ADMIN',         label: 'Admin',         color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'ASSET_MANAGER', label: 'Asset Manager', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'DEPT_MANAGER',  label: 'Dept. Manager', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'USER',          label: 'Employee',      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'VIEWER',        label: 'Viewer',        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
]

export function UsersClient({ users: initial, pending: initialPending }: any) {
  const router = useRouter()
  const [users,      setUsers]      = useState(initial)
  const [pending,    setPending]    = useState(initialPending)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [newRole,    setNewRole]    = useState('USER')
  const [saving,     setSaving]     = useState(false)
  const [actioning,  setActioning]  = useState<string | null>(null)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [invite,     setInvite]     = useState({ name: '', email: '', role: 'USER' })
  const [inviting,   setInviting]   = useState(false)
  const [inviteMsg,  setInviteMsg]  = useState('')
  const [search,     setSearch]     = useState('')
  const [approveRole,setApproveRole]= useState<Record<string, string>>({})

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function updateRole(id: string) {
    setSaving(true)
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setUsers((u: any[]) => u.map(x => x.id === id ? { ...x, role: newRole } : x))
      setEditingId(null)
    }
    setSaving(false)
  }

  async function approveUser(id: string, role: string) {
    setActioning(id + 'approve')
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, approvalStatus: 'APPROVED' }),
    })
    if (res.ok) {
      const approved = pending.find((p: any) => p.id === id)
      setPending((p: any[]) => p.filter((x: any) => x.id !== id))
      if (approved) setUsers((u: any[]) => [...u, { ...approved, role, approvalStatus: 'APPROVED', _count: { assignedAssets: 0 } }])
    }
    setActioning(null)
  }

  async function rejectUser(id: string) {
    setActioning(id + 'reject')
    await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'REJECTED' }),
    })
    setPending((p: any[]) => p.filter((x: any) => x.id !== id))
    setActioning(null)
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Remove ${name}? Their assets will be unassigned.`)) return
    setDeleting(id)
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers((u: any[]) => u.filter(x => x.id !== id))
    setDeleting(null)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: invite.name, email: invite.email, password: Math.random().toString(36).slice(-10), role: invite.role }),
    })
    const data = await res.json()
    setInviting(false)
    setInviteMsg(res.ok ? 'User created successfully!' : data.error ?? 'Failed')
    if (res.ok) setTimeout(() => { setShowInvite(false); setInviteMsg(''); router.refresh() }, 1500)
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3.5 flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          Users & roles
          {pending.length > 0 && <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length} pending</span>}
        </h1>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
          className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm placeholder-gray-400 outline-none w-48" />
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-colors">
          <UserPlus size={14} /> Add user
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Pending approvals */}
        {pending.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-800 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <Clock size={14} className="text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pending approvals — {pending.length} request{pending.length !== 1 ? 's' : ''}</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pending.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300 flex-shrink-0">
                    {p.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.email}{p.companyName ? ` · ${p.companyName}` : ''}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Registered {formatDate(p.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={approveRole[p.id] ?? 'USER'}
                      onChange={e => setApproveRole(r => ({ ...r, [p.id]: e.target.value }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-brand-600">
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => approveUser(p.id, approveRole[p.id] ?? 'USER')}
                      disabled={actioning === p.id + 'approve'}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                      {actioning === p.id + 'approve' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Approve
                    </button>
                    <button onClick={() => rejectUser(p.id)}
                      disabled={actioning === p.id + 'reject'}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                      {actioning === p.id + 'reject' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role legend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2"><Shield size={12} />Role permissions</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(r => <span key={r.value} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${r.color}`}>{r.label}</span>)}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {['User','Email','Role','Assets','Joined','Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No users found</td></tr>
              ) : filtered.map((u: any) => {
                const role    = ROLES.find(r => r.value === u.role) ?? ROLES[3]
                const editing = editingId === u.id
                return (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
                          {u.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() ?? '?'}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name ?? 'Unnamed'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      {editing ? (
                        <div className="flex items-center gap-1.5">
                          <select value={newRole} onChange={e => setNewRole(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs outline-none">
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <button onClick={() => updateRole(u.id)} disabled={saving}
                            className="w-6 h-6 rounded-lg bg-green-600 text-white flex items-center justify-center">
                            {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 flex items-center justify-center">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u._count?.assignedAssets ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 pr-5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditingId(u.id); setNewRole(u.role) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteUser(u.id, u.name)} disabled={deleting === u.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                          {deleting === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add user modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add user</h2>
              <button onClick={() => { setShowInvite(false); setInviteMsg('') }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={sendInvite} className="p-5 space-y-4">
              {inviteMsg && (
                <div className={`text-sm rounded-xl px-4 py-3 border ${inviteMsg.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{inviteMsg}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
                <input value={invite.name} onChange={e => setInvite(i => ({ ...i, name: e.target.value }))} required placeholder="e.g. Sailesh Kumar"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                <input type="email" value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} required placeholder="user@company.com"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                <select value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Mail size={12} className="mt-0.5 flex-shrink-0" />
                  User will be created and can sign in. Share the login URL with them so they can set their password via forgot password.
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={inviting}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-60">
                  {inviting ? <><Loader2 size={14} className="animate-spin" />Creating…</> : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
