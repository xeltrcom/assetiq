import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages each role can access
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'], // everything
  ASSET_MANAGER: [
    '/dashboard', '/assets', '/employees', '/devices',
    '/vendors', '/requests', '/maintenance', '/ai',
    '/alerts', '/reports', '/discovery', '/settings',
  ],
  DEPT_MANAGER: [
    '/dashboard', '/assets', '/employees', '/requests',
    '/alerts', '/reports', '/settings',
  ],
  USER: [
    '/dashboard', '/assets/my', '/requests', '/alerts', '/settings',
  ],
  VIEWER: [
    '/dashboard', '/assets', '/reports', '/settings',
  ],
}

// Pages that require ADMIN only
const ADMIN_ONLY = ['/users', '/settings/roles']

// Pages accessible without approval
const PUBLIC_PATHS = [
  '/auth/login', '/auth/register', '/auth/pending',
  '/api/auth', '/_next', '/favicon', '/xeltr-logo',
]

export default auth((req) => {
  const { nextUrl, auth: session } = req as any
  const path = nextUrl.pathname

  // Allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Not logged in → login
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }

  // Not approved → pending page
  const approvalStatus = session.user.approvalStatus
  if (approvalStatus === 'PENDING' || approvalStatus === 'REJECTED') {
    if (!path.startsWith('/auth/pending') && !path.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/auth/pending', nextUrl))
    }
    return NextResponse.next()
  }

  const role = session.user.role ?? 'USER'

  // Admin-only pages
  if (ADMIN_ONLY.some(p => path.startsWith(p)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Check role permissions
  const allowed = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.USER
  if (allowed.includes('*')) return NextResponse.next()

  const canAccess = allowed.some(p => path.startsWith(p)) || path.startsWith('/api/')
  if (!canAccess) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|xeltr-logo|public).*)',
  ],
}
