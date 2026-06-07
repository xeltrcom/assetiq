import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(2),
  email:       z.string().email(),
  password:    z.string().min(8),
  companyName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { name, email, password, companyName } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)

    // First user = ADMIN + auto-approved, everyone else = PENDING
    const count    = await prisma.user.count()
    const isAdmin  = count === 0
    const role     = isAdmin ? 'ADMIN' : 'USER'
    const approval = isAdmin ? 'APPROVED' : 'PENDING'

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role:           role as any,
        approvalStatus: approval as any,
        companyName:    companyName ?? null,
      },
    })

    // Notify all admins about new registration (except first user)
    if (!isAdmin) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
      await Promise.all(admins.map(admin =>
        prisma.notification.create({
          data: {
            userId:   admin.id,
            type:     'AI_ALERT',
            title:    `New user registration — ${name}`,
            message:  `${name} (${email})${companyName ? ` from ${companyName}` : ''} has requested access to AssetIQ. Review and approve in the Users section.`,
            severity: 'INFO',
          },
        })
      ))
    }

    return NextResponse.json({ success: true, isAdmin })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
