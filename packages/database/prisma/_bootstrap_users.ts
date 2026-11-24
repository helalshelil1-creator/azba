
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const USERS = [
  { email: 'admin@azba.com', password: 'Admin@12345', firstName: 'مدير', lastName: 'المنصة', role: 'SUPER_ADMIN' as const, wallet: { currency: 'EGP' } },
  { email: 'investor@example.com', password: 'Investor@12345', firstName: 'أحمد', lastName: 'المستثمر', role: 'INVESTOR' as const, phone: '01001234567', wallet: { currency: 'EGP', balance: 50000 } },
  { email: 'vet@azba.com', password: 'Vet@12345', firstName: 'د. محمود', lastName: 'البيطري', role: 'VETERINARIAN' as const, wallet: { currency: 'EGP' } },
]

async function main() {
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12)
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: 'ACTIVE',
        emailVerified: new Date(),
        ...(u.phone ? { phone: u.phone } : {}),
        wallet: { create: u.wallet as any },
      },
      update: {},
    })
    console.log('ok', u.email)
  }
}
main().finally(() => prisma.$disconnect())
