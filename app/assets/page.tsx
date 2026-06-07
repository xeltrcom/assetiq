import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { AssetsClient } from './client'

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string; page?: string }
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const page     = parseInt(searchParams.page ?? '1')
  const limit    = 20
  const search   = searchParams.search
  const category = searchParams.category
  const status   = searchParams.status

  const where: any = {}
  if (search) where.OR = [
    { name:         { contains: search, mode: 'insensitive' } },
    { assetTag:     { contains: search, mode: 'insensitive' } },
    { serialNumber: { contains: search, mode: 'insensitive' } },
    { ipAddress:    { contains: search, mode: 'insensitive' } },
    { hostname:     { contains: search, mode: 'insensitive' } },
  ]
  if (category) where.category = category
  if (status)   where.status   = status

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.asset.count({ where }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <AssetsClient
        assets={JSON.parse(JSON.stringify(assets))}
        total={total}
        page={page}
        pages={Math.ceil(total / limit)}
        filters={{ search, category, status }}
      />
    </div>
  )
}
