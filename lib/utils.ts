import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(days: number | null) {
  if (days === null) return null
  if (days < 0)  return { label: 'Expired',       class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }
  if (days <= 5) return { label: `${days}d left`,  class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }
  if (days <= 14)return { label: `${days}d left`,  class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
  if (days <= 30)return { label: `${days}d left`,  class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' }
  return               { label: `${days}d left`,  class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' }
}
