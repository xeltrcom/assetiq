import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { ReportsClient } from './client'

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const [
    categoryBreakdown,
    statusBreakdown,
    expiringNext30,
    expiringNext90,
    totalValue,
    recentlyAdded,
    topLocations,
  ] = await Promise.all([
    prisma.asset.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.asset.groupBy({ by: ['status'],   _count: { _all: true } }),
    prisma.asset.count({
      where: {
        OR: [
          { warrantyExpiry:  { gte: new Date(), lte: new Date(Date.now() + 30 * 86400000) } },
          { licenseExpiry:   { gte: new Date(), lte: new Date(Date.now() + 30 * 86400000) } },
          { insuranceExpiry: { gte: new Date(), lte: new Date(Date.now() + 30 * 86400000) } },
        ],
      },
    }),
    prisma.asset.count({
      where: {
        OR: [
          { warrantyExpiry:  { gte: new Date(), lte: new Date(Date.now() + 90 * 86400000) } },
          { licenseExpiry:   { gte: new Date(), lte: new Date(Date.now() + 90 * 86400000) } },
          { insuranceExpiry: { gte: new Date(), lte: new Date(Date.now() + 90 * 86400000) } },
        ],
      },
    }),
    prisma.asset.aggregate({ _sum: { currentValue: true, purchasePrice: true } }),
    prisma.asset.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, category: true, createdAt: true, assetTag: true } }),
    prisma.asset.groupBy({ by: ['location'], _count: { _all: true }, where: { location: { not: null } }, orderBy: { _count: { location: 'desc' } }, take: 5 }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <ReportsClient
        categoryBreakdown={categoryBreakdown}
        statusBreakdown={statusBreakdown}
        expiringNext30={expiringNext30}
        expiringNext90={expiringNext90}
        totalValue={totalValue._sum}
        recentlyAdded={JSON.parse(JSON.stringify(recentlyAdded))}
        topLocations={topLocations}
      />
    </div>
  )
}
