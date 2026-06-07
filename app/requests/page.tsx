import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { RequestsClient } from './client'

export default async function RequestsPage({
  searchParams,
}: { searchParams: { status?: string } }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const isAdmin = session.user!.role === 'ADMIN'

  const where: any = {}
  if (searchParams.status) where.status = searchParams.status
  if (!isAdmin) where.requestedById = session.user!.id

  const requests = await prisma.assetRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: { select: { id: true, name: true, email: true } },
      approvedBy:  { select: { id: true, name: true } },
    },
  })

  const counts = await prisma.assetRequest.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: isAdmin ? {} : { requestedById: session.user!.id },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <RequestsClient
        requests={JSON.parse(JSON.stringify(requests))}
        counts={counts}
        isAdmin={isAdmin}
        currentFilter={searchParams.status ?? 'ALL'}
      />
    </div>
  )
}
