import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = `${process.env.APP_URL}/assets/${params.id}`

  const qr = await QRCode.toDataURL(url, {
    width:  300,
    margin: 2,
    color:  { dark: '#2C2C2A', light: '#FFFFFF' },
  })

  return NextResponse.json({ qr, assetTag: asset.assetTag, name: asset.name, url })
}
