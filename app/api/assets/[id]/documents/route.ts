import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const docs = await prisma.assetDocument.findMany({
    where:   { assetId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File
    const type     = formData.get('type') as string ?? 'OTHER'
    const name     = formData.get('name') as string ?? file.name

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // Convert to base64 for Cloudinary
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder:        `assetiq/${params.id}`,
      resource_type: 'auto',
      public_id:     `${Date.now()}-${name.replace(/\s+/g, '-')}`,
    })

    const doc = await prisma.assetDocument.create({
      data: {
        assetId:      params.id,
        name:         name,
        type:         type as any,
        url:          result.secure_url,
        publicId:     result.public_id,
        size:         file.size,
        uploadedById: session.user!.id,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
