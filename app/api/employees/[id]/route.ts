import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      assets: {
        include: { assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(employee)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    delete body.id; delete body.employeeId; delete body.createdAt; delete body.updatedAt; delete body.assets

    if (body.joinedAt) body.joinedAt = new Date(body.joinedAt)
    if (body.joinedAt === '') body.joinedAt = null

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data:  body,
    })
    return NextResponse.json(employee)
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Unassign all assets first
  await prisma.asset.updateMany({
    where: { employeeId: params.id },
    data:  { employeeId: null },
  })

  await prisma.employee.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
