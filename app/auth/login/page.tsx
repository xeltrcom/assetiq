'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const res = await signIn('credentials', { email, password, redirect: false })

    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      const status = await fetch('/api/auth/approval-status').then(r => r.json())
      if (status.status === 'PENDING' || status.status === 'REJECTED') {
        router.push('/auth/pending')
      } else {
        router.push('/dashboard')
      }
    }
  }

  async function handleMicrosoft() {
    setLoading(true)
    await signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-600 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-800 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="text-3xl font-bold">
            <span className="text-brand-400">Asset</span>
            <span className="text-white">IQ</span>
          </div>
          <a href="https://xeltr.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-2 group w-fit">
            <span className="text-xs text-gray-500 group-hover:text-gray-400">powered by</span>
            <img src="/xeltr-logo.svg" alt="Xeltr" className="h-3.5 w-auto opacity-40 group-hover:opacity-70 transition-opacity" />
          </a>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-semibold text-white leading-tight">
            Enterprise asset management,<br />built for modern teams
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🔍', title: 'Track everything', desc: 'Laptops, licenses, vehicles, furniture — all in one place' },
              { icon: '🤖', title: 'AI-powered insights', desc: 'Auto-tag assets, predict maintenance, get instant answers' },
              { icon: '🔔', title: 'Smart alerts', desc: 'Never miss a warranty expiry or maintenance deadline' },
              { icon: '👥', title: 'Team ready', desc: 'Role-based access for every level of your organisation' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} Xeltr · AssetIQ
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold">
              <span className="text-brand-600">Asset</span>
              <span className="text-gray-900 dark:text-white">IQ</span>
            </div>
            <a href="https://xeltr.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 opacity-60 hover:opacity-100">
              <span className="text-xs text-gray-400">powered by</span>
              <img src="/xeltr-logo.svg" alt="Xeltr" className="h-3 w-auto" />
            </a>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your AssetIQ account</p>
          </div>

          {/* Microsoft SSO */}
          <button onClick={handleMicrosoft} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors mb-5 disabled:opacity-50 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            Continue with Microsoft
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com" autoComplete="email"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-sm" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-800 text-white font-medium rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm mt-2">
              {loading ? <><Loader2 size={15} className="animate-spin" />Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
