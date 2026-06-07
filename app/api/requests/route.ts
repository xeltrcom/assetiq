import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function generateRequestNumber() {
  const count = await prisma.assetRequest.count()
  return `REQ-${String(count + 1).padStart(5, '0')}`
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const mine   = searchParams.get('mine') === 'true'

  const where: any = {}
  if (status) where.status = status
  if (mine)   where.requestedById = session.user.id

  const requests = await prisma.assetRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: { select: { id: true, name: true, email: true } },
      approvedBy:  { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body          = await req.json()
    const requestNumber = await generateRequestNumber()

    const request = await prisma.assetRequest.create({
      data: {
        requestNumber,
        type:          body.type,
        title:         body.title,
        description:   body.description || null,
        urgency:       body.urgency     || 'NORMAL',
        assetCategory: body.assetCategory || null,
        quantity:      body.quantity    || 1,
        requestedById: session.user.id,
      },
      include: { requestedBy: { select: { name: true, email: true } } },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
