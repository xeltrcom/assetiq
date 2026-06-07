import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { EmployeeDetailClient } from './client'

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      assets: {
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true } } },
      },
    },
  })
  if (!employee) notFound()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <EmployeeDetailClient
        employee={JSON.parse(JSON.stringify(employee))}
        isAdmin={session.user.role === 'ADMIN'}
      />
    </div>
  )
}
