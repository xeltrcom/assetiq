import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function generateEmployeeId() {
  const count = await prisma.employee.count()
  return `EMP-${String(count + 1).padStart(4, '0')}`
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search     = searchParams.get('search')
  const department = searchParams.get('department')

  const where: any = {}
  if (search) where.OR = [
    { name:        { contains: search, mode: 'insensitive' } },
    { email:       { contains: search, mode: 'insensitive' } },
    { employeeId:  { contains: search, mode: 'insensitive' } },
    { department:  { contains: search, mode: 'insensitive' } },
    { designation: { contains: search, mode: 'insensitive' } },
  ]
  if (department) where.department = department

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { _count: { select: { assets: true } } },
  })

  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body       = await req.json()
    const employeeId = await generateEmployeeId()

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name:        body.name,
        email:       body.email       || null,
        phone:       body.phone       || null,
        department:  body.department  || null,
        designation: body.designation || null,
        location:    body.location    || null,
        joinedAt:    body.joinedAt    ? new Date(body.joinedAt) : null,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
