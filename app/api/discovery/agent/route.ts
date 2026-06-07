import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseAgentReport, deviceToAssetFields } from '@/lib/discovery'

// Receives POST from Windows PowerShell or Linux bash agent scripts
export async function POST(req: NextRequest) {
  try {
    const report = await req.json()
    if (!report.ip) return NextResponse.json({ error: 'No IP in report' }, { status: 400 })

    const fields = deviceToAssetFields(parseAgentReport(report))

    // Check if an asset with this IP or MAC already exists
    const existing = await prisma.asset.findFirst({
      where: {
        OR: [
          { ipAddress:  fields.ipAddress  ?? undefined },
          { macAddress: fields.macAddress ?? undefined },
        ],
      },
    })

    if (existing) {
      // Update existing asset with latest specs
      await prisma.asset.update({
        where: { id: existing.id },
        data: {
          ...fields,
          updatedAt: new Date(),
        },
      })
      return NextResponse.json({ status: 'updated', assetId: existing.id })
    }

    // Determine category from OS
    const os       = (fields.os ?? '').toLowerCase()
    const category = os.includes('windows') || os.includes('mac') || os.includes('linux')
      ? (fields.storageGb && fields.storageGb < 100 ? 'LAPTOP' : 'DESKTOP')
      : 'OTHER'

    // Auto-create a draft asset from the discovered device
    const count    = await prisma.asset.count({ where: { category: category as any } })
    const prefix   = category === 'LAPTOP' ? 'LPT' : 'DSK'
    const assetTag = `${prefix}-${String(count + 1).padStart(4, '0')}`

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name:     fields.hostname ?? `Discovered Device — ${fields.ipAddress}`,
        category: category as any,
        status:   'ACTIVE',
        ...fields,
      },
    })

    return NextResponse.json({ status: 'created', assetId: asset.id })
  } catch (err) {
    console.error('Agent report error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
