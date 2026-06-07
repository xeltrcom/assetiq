'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, Box, Laptop, FileText, Armchair, Car,
  Sparkles, Bell, BarChart3, ScanLine, Settings, Sun, Moon,
  LogOut, ChevronDown, Users, ClipboardList, Building2, Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  { section: 'Overview' },
  { href: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/assets',     label: 'All assets',     icon: Box },
  { href: '/employees',  label: 'Employees',      icon: Users },
  { section: 'Manage' },
  { href: '/devices',    label: 'Devices',        icon: Laptop },
  { href: '/assets?category=SOFTWARE_LICENSE', label: 'Licenses',  icon: FileText },
  { href: '/assets?category=FURNITURE',        label: 'Furniture', icon: Armchair },
  { href: '/assets?category=VEHICLE',          label: 'Vehicles',  icon: Car },
  { href: '/vendors',    label: 'Vendors',        icon: Building2 },
  { section: 'Workflow' },
  { href: '/requests',   label: 'Requests',       icon: ClipboardList, badge: 'requests' },
  { href: '/maintenance',label: 'Maintenance',    icon: Wrench },
  { section: 'Intelligence' },
  { href: '/ai',         label: 'AI assistant',   icon: Sparkles },
  { href: '/alerts',     label: 'Alerts',         icon: Bell },
  { href: '/reports',    label: 'Reports',        icon: BarChart3 },
  { section: 'Admin' },
  { href: '/discovery',  label: 'Discovery',      icon: ScanLine },
  { href: '/settings',   label: 'Settings',       icon: Settings },
]

export function Sidebar() {
  const pathname            = usePathname()
  const { data: session }   = useSession()
  const { theme, setTheme } = useTheme()
  const [userOpen, setUserOpen] = useState(false)

  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  return (
    <aside className="w-56 min-w-56 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="text-lg font-bold leading-none">
          <span className="text-brand-600">Asset</span>
          <span className="text-gray-900 dark:text-white">IQ</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          powered by <span className="text-brand-600 font-medium">Xeltr</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map((item, i) => {
          if ('section' in item) {
            return (
              <p key={i} className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 px-2 pt-4 pb-1 first:pt-1">
                {item.section}
              </p>
            )
          }
          const Icon   = item.icon!
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href!.split('?')[0]))

          return (
            <Link key={item.href} href={item.href!}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}>
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="relative">
          <button onClick={() => setUserOpen(!userOpen)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-semibold text-brand-800 dark:text-brand-200">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{session?.user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {userOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 z-50">
              <Link href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings size={14} /> Profile settings
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
