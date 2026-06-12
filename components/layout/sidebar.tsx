'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, Box, Laptop, FileText, Armchair, Car,
  Sparkles, Bell, BarChart3, ScanLine, Settings, Sun, Moon,
  LogOut, ChevronDown, Users, ClipboardList, Building2, Wrench,
  PanelLeftClose, PanelLeftOpen, X, Menu,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  { section: 'Overview' },
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/assets',     label: 'All assets',   icon: Box },
  { href: '/employees',  label: 'Employees',    icon: Users },
  { section: 'Manage' },
  { href: '/devices',    label: 'Devices',      icon: Laptop },
  { href: '/assets?category=SOFTWARE_LICENSE', label: 'Licenses',  icon: FileText },
  { href: '/assets?category=FURNITURE',        label: 'Furniture', icon: Armchair },
  { href: '/assets?category=VEHICLE',          label: 'Vehicles',  icon: Car },
  { href: '/vendors',    label: 'Vendors',      icon: Building2 },
  { section: 'Workflow' },
  { href: '/requests',   label: 'Requests',     icon: ClipboardList },
  { href: '/maintenance',label: 'Maintenance',  icon: Wrench },
  { section: 'Intelligence' },
  { href: '/ai',         label: 'AI assistant', icon: Sparkles },
  { href: '/alerts',     label: 'Alerts',       icon: Bell },
  { href: '/reports',    label: 'Reports',      icon: BarChart3 },
  { section: 'Admin' },
  { href: '/users',      label: 'Users',        icon: Users },
  { href: '/discovery',  label: 'Discovery',    icon: ScanLine },
  { href: '/settings',   label: 'Settings',     icon: Settings },
]

export function Sidebar() {
  const pathname            = usePathname()
  const { data: session }   = useSession()
  const { theme, setTheme } = useTheme()
  const [userOpen,    setUserOpen]    = useState(false)
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [mounted,     setMounted]     = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])
  useEffect(() => { setMounted(true) }, [])

  const initials = session?.user?.name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        'border-b border-gray-200 dark:border-gray-800 flex items-center gap-3',
        collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4'
      )}>
        {!collapsed && (
          <div className="flex-1">
            <div className="text-lg font-bold leading-none">
              <span className="text-brand-600">Asset</span>
              <span className="text-gray-900 dark:text-white">IQ</span>
            </div>
            <a href="https://xeltr.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1 group w-fit">
              <span className="text-[11px] text-gray-400 group-hover:text-gray-500">powered by</span>
              <img src="/xeltr-logo.svg" alt="Xeltr" className="h-3 w-auto opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
        {/* Mobile close button */}
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map((item, i) => {
          if ('section' in item) {
            if (collapsed) return <div key={i} className="my-2 border-t border-gray-100 dark:border-gray-800" />
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
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg text-sm transition-colors',
                collapsed ? 'px-2 py-2.5 justify-center' : 'px-2.5 py-2',
                active
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}>
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          suppressHydrationWarning
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            collapsed ? 'px-2 py-2.5 justify-center' : 'px-2.5 py-2'
          )}>
          <span>
            {mounted ? (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </span>
          {!collapsed && <span>{mounted ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : 'Dark mode'}</span>}
        </button>

        <div className="relative">
          <button onClick={() => setUserOpen(!userOpen)}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-2'
            )}>
            <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-semibold text-brand-800 dark:text-brand-200 flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{session?.user?.name ?? 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
                </div>
                <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
              </>
            )}
          </button>

          {userOpen && (
            <div className={cn(
              'absolute bottom-full mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 z-50',
              collapsed ? 'left-0 w-48' : 'left-0 right-0'
            )}>
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
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center shadow-sm"
      >
        <Menu size={16} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar — slides up from bottom */}
      <aside className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-2xl flex flex-col transition-transform duration-300 max-h-[85vh]',
        mobileOpen ? 'translate-y-0' : 'translate-y-full'
      )}>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}>
        <NavContent />
      </aside>
    </>
  )
}
