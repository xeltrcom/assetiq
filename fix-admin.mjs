import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'admin@xeltr.com' },
  data:  { approvalStatus: 'APPROVED', role: 'ADMIN' },
})

console.log('Done! Admin account approved.')
await prisma.$disconnect()