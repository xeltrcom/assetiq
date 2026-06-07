import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { VendorsClient } from './client'

export default async function VendorsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <VendorsClient vendors={JSON.parse(JSON.stringify(vendors))} />
    </div>
  )
}
