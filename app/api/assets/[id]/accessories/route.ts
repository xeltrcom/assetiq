import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessories = await prisma.assetAccessory.findMany({
    where:   { parentAssetId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(accessories)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const accessory = await prisma.assetAccessory.create({
    data: {
      parentAssetId: params.id,
      name:          body.name,
      brand:         body.brand         || null,
      model:         body.model         || null,
      serialNumber:  body.serialNumber  || null,
      purchaseDate:  body.purchaseDate  ? new Date(body.purchaseDate) : null,
      purchasePrice: body.purchasePrice ? Number(body.purchasePrice)  : null,
      warrantyExpiry:body.warrantyExpiry? new Date(body.warrantyExpiry): null,
      notes:         body.notes         || null,
    },
  })

  return NextResponse.json(accessory, { status: 201 })
}
