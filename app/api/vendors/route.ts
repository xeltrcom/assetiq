import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const vendors = await prisma.vendor.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(vendors)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body  = await req.json()
  const count = await prisma.vendor.count()
  const vendor = await prisma.vendor.create({
    data: {
      vendorCode:    `VND-${String(count + 1).padStart(4, '0')}`,
      name:          body.name,
      contactPerson: body.contactPerson || null,
      phone:         body.phone         || null,
      email:         body.email         || null,
      address:       body.address       || null,
      website:       body.website       || null,
      category:      body.category      || null,
      notes:         body.notes         || null,
    },
  })
  return NextResponse.json(vendor, { status: 201 })
}
