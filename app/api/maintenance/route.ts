import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const schedules = await prisma.maintenanceSchedule.findMany({
    orderBy: { scheduledAt: 'asc' },
    include: { asset: { select: { id: true, name: true, assetTag: true } } },
  })
  return NextResponse.json(schedules)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const schedule = await prisma.maintenanceSchedule.create({
    data: {
      assetId:       body.assetId,
      title:         body.title,
      description:   body.description   || null,
      scheduledAt:   new Date(body.scheduledAt),
      technicianName:body.technicianName || null,
      cost:          body.cost           || null,
      status:        'SCHEDULED',
    },
    include: { asset: { select: { id: true, name: true, assetTag: true } } },
  })

  return NextResponse.json(schedule, { status: 201 })
}
