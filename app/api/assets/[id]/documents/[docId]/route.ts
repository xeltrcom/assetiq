import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await prisma.assetDocument.findUnique({ where: { id: params.docId } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from Cloudinary
  if (doc.publicId) {
    await cloudinary.uploader.destroy(doc.publicId).catch(() => {})
  }

  await prisma.assetDocument.delete({ where: { id: params.docId } })
  return NextResponse.json({ success: true })
}
