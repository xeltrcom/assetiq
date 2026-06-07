import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { autoTagAsset } from '@/lib/openai'
import { z } from 'zod'

const createSchema = z.object({
  name:            z.string().min(1),
  category:        z.string(),
  description:     z.string().optional(),
  brand:           z.string().optional(),
  model:           z.string().optional(),
  serialNumber:    z.string().optional(),
  ipAddress:       z.string().optional(),
  macAddress:      z.string().optional(),
  hostname:        z.string().optional(),
  os:              z.string().optional(),
  osVersion:       z.string().optional(),
  processor:       z.string().optional(),
  ramGb:           z.number().optional(),
  storageGb:       z.number().optional(),
  batteryHealth:   z.number().optional(),
  licenseKey:      z.string().optional(),
  licenseSeats:    z.number().optional(),
  vendor:          z.string().optional(),
  vehicleReg:      z.string().optional(),
  purchaseDate:    z.string().optional(),
  purchasePrice:   z.number().optional(),
  currentValue:    z.number().optional(),
  depreciationRate:z.number().optional(),
  warrantyExpiry:  z.string().optional(),
  licenseExpiry:   z.string().optional(),
  insuranceExpiry: z.string().optional(),
  maintenanceDue:  z.string().optional(),
  location:        z.string().optional(),
  assignedToId:    z.string().optional(),
  employeeId:      z.string().optional(),
})

// Generate a unique asset tag like LPT-0042
async function generateAssetTag(category: string) {
  const prefixes: Record<string, string> = {
    LAPTOP: 'LPT', DESKTOP: 'DSK', SERVER: 'SRV', PRINTER: 'PRN',
    NETWORK_DEVICE: 'NET', MOBILE: 'MOB', SOFTWARE_LICENSE: 'SFT',
    FURNITURE: 'FRN', VEHICLE: 'VHL', OTHER: 'AST',
  }
  const prefix = prefixes[category] ?? 'AST'
  const count  = await prisma.asset.count({ where: { category: category as any } })
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}

// GET — list all assets with filters
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search')
  const category = searchParams.get('category')
  const status   = searchParams.get('status')
  const page     = parseInt(searchParams.get('page') ?? '1')
  const limit    = parseInt(searchParams.get('limit') ?? '20')

  const where: any = {}
  if (search)   where.OR = [
    { name:         { contains: search, mode: 'insensitive' } },
    { assetTag:     { contains: search, mode: 'insensitive' } },
    { serialNumber: { contains: search, mode: 'insensitive' } },
    { ipAddress:    { contains: search, mode: 'insensitive' } },
    { hostname:     { contains: search, mode: 'insensitive' } },
  ]
  if (category) where.category = category
  if (status)   where.status   = status

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    }),
    prisma.asset.count({ where }),
  ])

  return NextResponse.json({ assets, total, page, pages: Math.ceil(total / limit) })
}

// POST — create a new asset
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })

    const data     = parsed.data
    const assetTag = await generateAssetTag(data.category)

    // AI auto-tag in background
    let aiTags: string[] = []
    if (process.env.OPENAI_API_KEY) {
      try {
        aiTags = await autoTagAsset(data.name, data.description ?? '')
      } catch {}
    }

    const asset = await prisma.asset.create({
      data: {
        ...data,
        assetTag,
        aiTags,
        category:        data.category       as any,
        purchaseDate:    data.purchaseDate    ? new Date(data.purchaseDate)    : undefined,
        warrantyExpiry:  data.warrantyExpiry  ? new Date(data.warrantyExpiry)  : undefined,
        licenseExpiry:   data.licenseExpiry   ? new Date(data.licenseExpiry)   : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
        maintenanceDue:  data.maintenanceDue  ? new Date(data.maintenanceDue)  : undefined,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        userId:  session.user.id,
        action:  'CREATED',
        newValue: asset.name,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
