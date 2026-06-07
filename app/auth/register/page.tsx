'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters'); return }

    setLoading(true); setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, companyName: form.company }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Registration failed'); setLoading(false); return }

    // If first user (admin), go to login. Otherwise go to pending
    router.push(data.isAdmin ? '/auth/login?registered=1' : '/auth/pending')
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input type={type} value={form[key as keyof typeof form]}
        onChange={e => update(key, e.target.value)} required placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-brand-600">Asset</span>
            <span className="text-gray-900 dark:text-white">IQ</span>
          </h1>
          <a href="https://xeltr.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-400">powered by</span>
            <img src="/xeltr-logo.svg" alt="Xeltr" className="h-3.5 w-auto" />
          </a>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your account will be reviewed by an admin before you can sign in.</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4 border border-red-200 dark:border-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('Full name',        'name',     'text',     'Arun G')}
            {field('Work email',       'email',    'email',    'you@company.com')}
            {field('Company name',     'company',  'text',     'e.g. Xeltr, Acme Corp')}
            {field('Password',         'password', 'password', '••••••••')}
            {field('Confirm password', 'confirm',  'password', '••••••••')}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-800 text-white font-medium rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Creating account…' : 'Request access'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
