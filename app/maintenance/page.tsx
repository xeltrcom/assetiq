import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { MaintenanceClient } from './client'

export default async function MaintenancePage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const schedules = await prisma.maintenanceSchedule.findMany({
    orderBy: { scheduledAt: 'asc' },
    include: { asset: { select: { id: true, name: true, assetTag: true, category: true } } },
  })

  const assets = await prisma.asset.findMany({
    where:   { status: { not: 'RETIRED' } },
    select:  { id: true, name: true, assetTag: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <MaintenanceClient
        schedules={JSON.parse(JSON.stringify(schedules))}
        assets={assets}
      />
    </div>
  )
}
