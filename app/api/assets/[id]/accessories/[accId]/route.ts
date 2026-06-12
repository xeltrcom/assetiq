import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; accId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (body.purchaseDate)   body.purchaseDate   = new Date(body.purchaseDate)
  if (body.warrantyExpiry) body.warrantyExpiry = new Date(body.warrantyExpiry)
  if (body.purchasePrice)  body.purchasePrice  = Number(body.purchasePrice)

  const accessory = await prisma.assetAccessory.update({
    where: { id: params.accId },
    data:  body,
  })
  return NextResponse.json(accessory)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; accId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.assetAccessory.delete({ where: { id: params.accId } })
  return NextResponse.json({ success: true })
}
