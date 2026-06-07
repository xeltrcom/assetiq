import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(asset)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Convert date strings and numbers
    const dateFields   = ['purchaseDate','warrantyExpiry','licenseExpiry','insuranceExpiry','maintenanceDue']
    const numberFields = ['ramGb','storageGb','batteryHealth','licenseSeats','purchasePrice','currentValue','depreciationRate']

    dateFields.forEach(k => {
      if (body[k]) body[k] = new Date(body[k])
      else if (body[k] === '') body[k] = null
    })
    numberFields.forEach(k => {
      if (body[k] !== '' && body[k] != null) body[k] = Number(body[k])
      else if (body[k] === '') body[k] = null
    })

    // Remove read-only fields
    delete body.id; delete body.assetTag; delete body.createdAt
    delete body.updatedAt; delete body.auditLogs; delete body.maintenanceLogs
    delete body.assignedTo

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data:  body,
    })

    await prisma.auditLog.create({
      data: {
        assetId: params.id,
        userId:  session.user.id,
        action:  'UPDATED',
        notes:   'Asset details updated',
      },
    })

    return NextResponse.json(asset)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.asset.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
