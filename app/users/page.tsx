import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { UsersClient } from './client'

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user!.role !== 'ADMIN') redirect('/dashboard')

  const [users, pending] = await Promise.all([
    prisma.user.findMany({
      where:   { approvalStatus: 'APPROVED' },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { assignedAssets: true } } },
    }),
    prisma.user.findMany({
      where:   { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      select:  { id: true, name: true, email: true, companyName: true, createdAt: true, approvalStatus: true },
    }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <UsersClient
        users={JSON.parse(JSON.stringify(users))}
        pending={JSON.parse(JSON.stringify(pending))}
      />
    </div>
  )
}
