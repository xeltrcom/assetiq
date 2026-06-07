import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { EmployeesClient } from './client'

export default async function EmployeesPage({
  searchParams,
}: { searchParams: { search?: string; department?: string } }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const where: any = {}
  if (searchParams.search) where.OR = [
    { name:       { contains: searchParams.search, mode: 'insensitive' } },
    { email:      { contains: searchParams.search, mode: 'insensitive' } },
    { department: { contains: searchParams.search, mode: 'insensitive' } },
  ]
  if (searchParams.department) where.department = searchParams.department

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { _count: { select: { assets: true } } },
  })

  const departments = await prisma.employee.groupBy({
    by: ['department'],
    where: { department: { not: null } },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <EmployeesClient
        employees={JSON.parse(JSON.stringify(employees))}
        departments={departments.map(d => d.department).filter(Boolean)}
        filters={searchParams}
      />
    </div>
  )
}
