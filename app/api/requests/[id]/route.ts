import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { action, note } = body

    let status: string
    const data: any = { updatedAt: new Date() }

    if (action === 'approve') {
      status = 'APPROVED'
      data.status      = status
      data.approvedById = session.user.id
      data.adminNote   = note || null
    } else if (action === 'reject') {
      status = 'REJECTED'
      data.status    = status
      data.adminNote = note || null
    } else if (action === 'fulfil') {
      data.status = 'FULFILLED'
    } else if (action === 'cancel') {
      data.status = 'CANCELLED'
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const request = await prisma.assetRequest.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(request)
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
