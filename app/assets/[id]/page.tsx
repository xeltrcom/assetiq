import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { AssetDetailClient } from './client'

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const asset = await prisma.asset.findUnique({
    where:   { id: params.id },
    include: {
      assignedTo:     { select: { id: true, name: true, email: true } },
      auditLogs:      { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true } } } },
      maintenanceLogs:{ orderBy: { performedAt: 'desc' } },
    },
  })

  if (!asset) notFound()

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <AssetDetailClient
        asset={JSON.parse(JSON.stringify(asset))}
        users={users}
        isAdmin={session.user.role === 'ADMIN'}
      />
    </div>
  )
}
