import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendApprovalEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { role, approvalStatus } = body

  const user = await prisma.user.update({
    where: { id: params.id },
    data:  {
      ...(role           ? { role }           : {}),
      ...(approvalStatus ? { approvalStatus } : {}),
    },
  })

  // Send email notification if approval status changed
  if (approvalStatus && user.email) {
    await sendApprovalEmail({
      to:       user.email,
      name:     user.name ?? 'User',
      status:   approvalStatus,
      role:     user.role,
    }).catch(() => {}) // don't fail if email fails
  }

  return NextResponse.json(user)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user!.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Unassign their assets first
  await prisma.asset.updateMany({
    where: { assignedToId: params.id },
    data:  { assignedToId: null },
  })

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
