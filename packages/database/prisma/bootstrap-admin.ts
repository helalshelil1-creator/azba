/**
 * Production bootstrap: create/refresh the first real SUPER_ADMIN and lock the
 * documented demo accounts. Nothing is deleted (data and history are kept).
 *
 *   ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='...' [SECURE_DEMO_ACCOUNTS=1] \
 *   DATABASE_URL=... npx tsx prisma/bootstrap-admin.ts
 *
 * The password is read from the environment only and is never printed.
 */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const DEMO_EMAILS = ['admin@azba.com', 'investor@example.com', 'vet@azba.com']

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  if (!email || !email.includes('@')) throw new Error('ADMIN_EMAIL is required')
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters')
  if (/^(Admin@12345|Investor@12345|Vet@12345)$/.test(password)) throw new Error('ADMIN_PASSWORD must not be a seed password')

  const prisma = new PrismaClient()
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'Azba',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: new Date(),
        wallet: { create: { currency: 'EGP' } },
      },
      update: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE', failedLoginAttempts: 0, lockedUntil: null, deletedAt: null },
    })
    console.log(`SUPER_ADMIN ready: ${admin.email}`)

    if (process.env.SECURE_DEMO_ACCOUNTS === '1') {
      for (const demo of DEMO_EMAILS.filter((e) => e !== email)) {
        const randomHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12)
        const r = await prisma.user.updateMany({
          where: { email: demo },
          data: { passwordHash: randomHash, status: 'BLOCKED' },
        })
        console.log(`demo account ${demo}: ${r.count ? 'blocked, password replaced' : 'not present'}`)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e.message); process.exit(1) })
