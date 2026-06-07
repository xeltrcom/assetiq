'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, CheckCircle, XCircle, LogOut, RefreshCw } from 'lucide-react'

export default function PendingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [checking, setChecking] = useState(false)

  async function checkStatus() {
    setChecking(true)
    const res  = await fetch('/api/auth/approval-status')
    const data = await res.json()
    setStatus(data.status)
    if (data.status === 'APPROVED') {
      setTimeout(() => router.push('/dashboard'), 1500)
    }
    setChecking(false)
  }

  useEffect(() => {
    checkStatus()
    // Auto-check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Status card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center">

          {status === 'PENDING' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Awaiting admin approval
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Your account has been created successfully. An admin will review your request and assign you the appropriate access level.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Signed in as <span className="font-medium text-gray-600 dark:text-gray-300">{session?.user?.email}</span>
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">What happens next?</p>
                <ul className="space-y-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <li className="flex items-start gap-2"><span className="mt-0.5">1.</span> Admin receives a notification about your registration</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">2.</span> They review your details and assign you a role</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">3.</span> You receive access based on your assigned role</li>
                </ul>
              </div>

              <button onClick={checkStatus} disabled={checking}
                className="flex items-center gap-2 mx-auto text-sm text-brand-600 hover:text-brand-800 font-medium">
                <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                {checking ? 'Checking…' : 'Check approval status'}
              </button>
              <p className="text-xs text-gray-400 mt-2">Auto-checks every 30 seconds</p>
            </>
          )}

          {status === 'APPROVED' && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                You're approved! 🎉
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your account has been approved. Redirecting you to the dashboard…
              </p>
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </>
          )}

          {status === 'REJECTED' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Access request declined
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your access request has been reviewed and unfortunately declined. Please contact your administrator for more information or to request access again.
              </p>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 mb-6">
                <p className="text-xs text-red-700 dark:text-red-400">
                  If you believe this is a mistake, please contact your IT administrator directly.
                </p>
              </div>
            </>
          )}

          <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-2 mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Xeltr · AssetIQ
        </p>
      </div>
    </div>
  )
}
