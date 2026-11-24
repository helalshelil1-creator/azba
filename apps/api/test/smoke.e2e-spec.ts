import { PrismaClient } from '@prisma/client'
import { bootApp, client, makeUser, loginAs } from './helpers'

/** Smoke: every remaining read route answers without a 5xx for a role that is allowed to use it. */
describe('read-route smoke (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any, call: ReturnType<typeof client>, admin: string, investor: string
  beforeAll(async () => {
    const b = await bootApp(); app = b.app; call = client(b.base)
    admin = (await loginAs(call, (await makeUser(prisma, 'SUPER_ADMIN')).email)).accessToken
    investor = (await loginAs(call, (await makeUser(prisma, 'INVESTOR')).email)).accessToken
  })
  afterAll(async () => { await app.close(); await prisma.$disconnect() })

  const adminRoutes = [
    '/admin/dashboard', '/admin/kpis', '/admin/audit-logs', '/admin/pending-approvals',
    '/users', '/users/stats', '/animals', '/animals/stats', '/animals/qr/NOPE',
    '/farms', '/farms/stats', '/projects', '/projects/stats', '/projects/admin/all',
    '/investments/admin/all', '/financial/accounts', '/financial/journal-entries', '/financial/expenses',
    '/financial/reports/trial-balance', '/financial/reports/profit-loss', '/financial/distributions',
    '/support/tickets/all', '/support/tickets/stats', '/notifications/stats',
  ]
  it.each(adminRoutes)('GET %s is not a 5xx for SUPER_ADMIN', async (route) => {
    const r = await call('GET', route, { token: admin })
    expect(r.status).toBeLessThan(500)
  })

  const investorRoutes = ['/investments/dashboard', '/investments', '/investments/wallet', '/investments/wallet/transactions', '/investments/reservations', '/support/tickets', '/notifications', '/auth/me']
  it.each(investorRoutes)('GET %s is not a 5xx for INVESTOR', async (route) => {
    const r = await call('GET', route, { token: investor })
    expect(r.status).toBeLessThan(500)
  })

  it('investor is blocked from admin-only reads', async () => {
    for (const route of ['/admin/dashboard', '/users', '/financial/accounts', '/investments/admin/all', '/animals']) {
      expect((await call('GET', route, { token: investor })).status).toBe(403)
    }
  })
})
