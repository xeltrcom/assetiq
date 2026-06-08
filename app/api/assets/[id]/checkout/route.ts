import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, employeeId, notes, expectedReturnDate } = body

  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (action === 'checkout') {
    // Assign to employee
    await prisma.asset.update({
      where: { id: params.id },
      data:  {
        employeeId,
        status: 'ACTIVE',
      },
    })

    await prisma.auditLog.create({
      data: {
        assetId: params.id,
        userId:  session.user!.id,
        action:  'CHECKED OUT',
        notes:   `Checked out to employee${notes ? ` — ${notes}` : ''}${expectedReturnDate ? ` (expected return: ${expectedReturnDate})` : ''}`,
      },
    })

    return NextResponse.json({ success: true, action: 'checkout' })
  }

  if (action === 'checkin') {
    await prisma.asset.update({
      where: { id: params.id },
      data:  { employeeId: null, status: 'ACTIVE' },
    })

    await prisma.auditLog.create({
      data: {
        assetId: params.id,
        userId:  session.user!.id,
        action:  'CHECKED IN',
        notes:   notes ? `Returned — ${notes}` : 'Asset returned',
      },
    })

    return NextResponse.json({ success: true, action: 'checkin' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
