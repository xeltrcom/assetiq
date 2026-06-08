import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.user!.id },
    orderBy: { createdAt: 'desc' },
    take:    limit,
    include: { asset: { select: { id: true, name: true, assetTag: true } } },
  })

  return NextResponse.json(notifications)
}
