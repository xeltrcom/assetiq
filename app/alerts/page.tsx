import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { AlertsClient } from './client'

export default async function AlertsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take:    100,
    include: { asset: { select: { id: true, name: true, assetTag: true, category: true } } },
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <AlertsClient
        notifications={JSON.parse(JSON.stringify(notifications))}
        unreadCount={unreadCount}
        userId={session.user.id}
      />
    </div>
  )
}
