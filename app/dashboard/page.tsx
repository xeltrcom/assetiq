import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardClient } from './client'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const [
    totalAssets,
    activeAssets,
    expiringAssets,
    expiredAssets,
    unassignedAssets,
    recentAssets,
    recentNotifications,
    categoryBreakdown,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'ACTIVE' } }),
    prisma.asset.count({ where: { status: 'EXPIRING_SOON' } }),
    prisma.asset.count({ where: { status: 'EXPIRED' } }),
    prisma.asset.count({ where: { assignedToId: null, status: 'ACTIVE' } }),
    prisma.asset.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: session.user!.id, read: false },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { asset: { select: { name: true, assetTag: true } } },
    }),
    prisma.asset.groupBy({
      by: ['category'],
      _count: { _all: true },
    }),
  ])

  const totalValue = await prisma.asset.aggregate({
    _sum: { currentValue: true },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <DashboardClient
        stats={{
          totalAssets,
          activeAssets,
          expiringAssets,
          expiredAssets,
          unassignedAssets,
          totalValue: totalValue._sum.currentValue ?? 0,
        }}
        recentAssets={JSON.parse(JSON.stringify(recentAssets))}
        notifications={JSON.parse(JSON.stringify(recentNotifications))}
        categoryBreakdown={categoryBreakdown}
        userName={session.user!.name ?? 'Admin'}
      />
    </div>
  )
}
