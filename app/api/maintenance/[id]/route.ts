import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (body.completedAt) body.completedAt = new Date(body.completedAt)

  const schedule = await prisma.maintenanceSchedule.update({
    where: { id: params.id },
    data:  body,
  })
  return NextResponse.json(schedule)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.maintenanceSchedule.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
