'use client'

import { useState, createContext, useContext } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Toast = {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

const ToastContext = createContext<{
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}>({ toasts: [], toast: () => {}, dismiss: () => {} })

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  function toast(t: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
  }

  function dismiss(id: string) {
    setToasts(prev => prev.filter(x => x.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white dark:bg-gray-900',
              t.variant === 'destructive'
                ? 'border-red-200 dark:border-red-800'
                : 'border-gray-200 dark:border-gray-800'
            )}
          >
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                t.variant === 'destructive' ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'
              )}>{t.title}</p>
              {t.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
              )}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}