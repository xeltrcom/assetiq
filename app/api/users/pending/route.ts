import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const pending = await prisma.user.findMany({
    where:   { approvalStatus: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    select:  {
      id:           true,
      name:         true,
      email:        true,
      companyName:  true,
      createdAt:    true,
      approvalStatus: true,
    },
  })

  return NextResponse.json(pending)
}
