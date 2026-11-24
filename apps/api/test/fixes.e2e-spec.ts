import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { bootApp, client, makeUser, loginAs, mails, PASSWORD } from './helpers'

/** يحتاج DATABASE_URL لقاعدة اختبار فارغة (لا تشغّله على بيانات حقيقية). */
describe('azba fixes (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any
  let call: ReturnType<typeof client>
  let projectId: string

  async function newProject(shares = 5) {
    const farm = await prisma.farm.create({
      data: { name: 'F', code: `F-${randomBytes(3).toString('hex')}`, address: 'a', city: 'c', governorate: 'g' } as any,
    })
    const p = await prisma.project.create({
      data: {
        code: `P-${randomBytes(3).toString('hex')}`, name: 'P', farmId: farm.id, animalType: 'BEEF_CATTLE' as any,
        breed: 'b', targetAmount: shares * 1000, sharePrice: 1000, totalShares: shares,
        availableShares: shares, status: 'FUNDING' as any,
      } as any,
    })
    await prisma.projectShare.createMany({
      data: Array.from({ length: shares }, (_, i) => ({ projectId: p.id, shareNumber: `${p.code}-${i + 1}` })) as any,
    })
    return p.id
  }
  const avail = async (id: string) => (await prisma.project.findUniqueOrThrow({ where: { id } })).availableShares

  beforeAll(async () => {
    const b = await bootApp()
    app = b.app
    call = client(b.base)
    projectId = await newProject(5)
  })
  afterAll(async () => { await app.close(); await prisma.$disconnect() })

  describe('roles (explicit membership, no hierarchy leak)', () => {
    it('INVESTMENT_MANAGER cannot use finance-only endpoint, FINANCE_MANAGER can reach it', async () => {
      const im = await makeUser(prisma, 'INVESTMENT_MANAGER')
      const fm = await makeUser(prisma, 'FINANCE_MANAGER')
      const t1 = (await loginAs(call, im.email)).accessToken
      const t2 = (await loginAs(call, fm.email)).accessToken
      const id = '11111111-1111-4111-8111-111111111111'
      expect((await call('POST', `/financial/distributions/${id}/approve`, { token: t1 })).status).toBe(403)
      expect((await call('POST', `/financial/distributions/${id}/approve`, { token: t2 })).status).toBe(404)
    })
    it('SUPPORT_MANAGER keeps support access but not finance', async () => {
      const sm = await makeUser(prisma, 'SUPPORT_MANAGER')
      const t = (await loginAs(call, sm.email)).accessToken
      expect((await call('GET', '/financial/accounts', { token: t })).status).toBe(403)
      expect((await call('GET', '/support/tickets', { token: t })).status).not.toBe(403)
    })
  })

  describe('role escalation', () => {
    it('ADMIN cannot touch SUPER_ADMIN, self, or grant admin roles; can set ordinary roles', async () => {
      const admin = await makeUser(prisma, 'ADMIN')
      const sa = await makeUser(prisma, 'SUPER_ADMIN')
      const inv = await makeUser(prisma, 'INVESTOR')
      const t = (await loginAs(call, admin.email)).accessToken
      expect((await call('PATCH', `/users/${sa.id}/role`, { token: t, body: { role: 'INVESTOR' } })).status).toBe(403)
      expect((await call('PATCH', `/users/${sa.id}/status`, { token: t, body: { status: 'ACTIVE' } })).status).toBe(403)
      expect((await call('PATCH', `/users/${admin.id}/role`, { token: t, body: { role: 'SUPER_ADMIN' } })).status).toBe(403)
      expect((await call('PATCH', `/users/${inv.id}/role`, { token: t, body: { role: 'SUPER_ADMIN' } })).status).toBe(403)
      expect((await call('PATCH', `/users/${inv.id}/role`, { token: t, body: { role: 'ADMIN' } })).status).toBe(403)
      expect((await call('PATCH', `/users/${inv.id}/role`, { token: t, body: { role: 'FARM_MANAGER' } })).status).toBe(200)
      const tsa = (await loginAs(call, sa.email)).accessToken
      expect((await call('PATCH', `/users/${inv.id}/role`, { token: tsa, body: { role: 'ADMIN' } })).status).toBe(200)
    })
  })

  describe('reservations & share counter', () => {
    it('lazy expiry restores counter exactly; cancel restores; no drift', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'r')
      const t = (await loginAs(call, u.email)).accessToken
      const r1 = await call('POST', '/investments/reservations', { token: t, body: { projectId, shareCount: 3 } })
      expect(r1.status).toBe(201)
      expect(await avail(projectId)).toBe(2)
      // simulate expiry
      await prisma.shareReservation.update({ where: { id: r1.json.id }, data: { expiresAt: new Date(Date.now() - 1000) } })
      await prisma.projectShare.updateMany({ where: { reservedBy: u.id }, data: { reservationExpiresAt: new Date(Date.now() - 1000) } })
      const mismatch = await prisma.shareReservation.findUnique({ where: { id: r1.json.id } })
      // reservation expiresAt must match the share rows' value for release; align them
      await prisma.projectShare.updateMany({ where: { reservedBy: u.id }, data: { reservationExpiresAt: mismatch!.expiresAt } })
      const r2 = await call('POST', '/investments/reservations', { token: t, body: { projectId, shareCount: 4 } })
      expect(r2.status).toBe(201) // possible only if expired 3 were released (2+3=5 >= 4)
      expect(await avail(projectId)).toBe(1)
      const reserved = await prisma.projectShare.count({ where: { projectId, status: 'RESERVED' } })
      expect(reserved).toBe(4) // counter and rows agree
      expect((await prisma.shareReservation.findUnique({ where: { id: r1.json.id } }))!.status).toBe('EXPIRED')
      expect((await call('DELETE', `/investments/reservations/${r2.json.id}`, { token: t })).status).toBe(200)
      expect(await avail(projectId)).toBe(5)
      expect(await prisma.projectShare.count({ where: { projectId, status: 'AVAILABLE' } })).toBe(5)
    })
    it('background expiry job releases and keeps counter consistent', async () => {
      const pid = await newProject(4)
      const u = await makeUser(prisma, 'INVESTOR', 'cron')
      const t = (await loginAs(call, u.email)).accessToken
      const r = await call('POST', '/investments/reservations', { token: t, body: { projectId: pid, shareCount: 2 } })
      const past = new Date(Date.now() - 5000)
      await prisma.shareReservation.update({ where: { id: r.json.id }, data: { expiresAt: past } })
      await prisma.projectShare.updateMany({ where: { reservedBy: u.id, projectId: pid }, data: { reservationExpiresAt: past } })
      const svc = app.get(require('../src/modules/investments/investments.service').InvestmentsService)
      expect(await svc.expireOldReservations()).toBe(1)
      expect(await svc.expireOldReservations()).toBe(0)
      expect(await avail(pid)).toBe(4)
    })
    it('cannot reserve more than available', async () => {
      const pid = await newProject(2)
      const u = await makeUser(prisma, 'INVESTOR', 'over')
      const t = (await loginAs(call, u.email)).accessToken
      expect((await call('POST', '/investments/reservations', { token: t, body: { projectId: pid, shareCount: 3 } })).status).toBe(400)
      expect(await avail(pid)).toBe(2)
    })
  })

  describe('confirm investment / wallet', () => {
    it('rejects non-sandbox methods, ignores client providerRef, never debits wallet, single winner on double confirm, FUNDED when sold out', async () => {
      const pid = await newProject(2)
      const u = await makeUser(prisma, 'INVESTOR', 'c')
      const t = (await loginAs(call, u.email)).accessToken
      const r = await call('POST', '/investments/reservations', { token: t, body: { projectId: pid, shareCount: 2 } })
      expect(r.status).toBe(201)
      const bad = await call('POST', '/investments/confirm', { token: t, body: { reservationId: r.json.id, paymentMethod: 'CARD', acceptContract: true, providerRef: 'fake' } })
      expect(bad.status).toBe(400)
      const noContract = await call('POST', '/investments/confirm', { token: t, body: { reservationId: r.json.id, paymentMethod: 'SANDBOX', acceptContract: false } })
      expect(noContract.status).toBe(400)
      const body = { reservationId: r.json.id, paymentMethod: 'SANDBOX', acceptContract: true, providerRef: 'CLIENT-CLAIMED' }
      const [a, b] = await Promise.all([call('POST', '/investments/confirm', { token: t, body }), call('POST', '/investments/confirm', { token: t, body })])
      expect([a.status, b.status].sort()).toEqual([201, 400])
      expect(await prisma.investment.count({ where: { userId: u.id } })).toBe(1)
      const pay = await prisma.payment.findFirstOrThrow({ where: { userId: u.id } })
      expect(pay.providerRef.startsWith('SANDBOX-')).toBe(true)
      expect(pay.provider).toBe('SANDBOX')
      expect((await prisma.wallet.findUniqueOrThrow({ where: { userId: u.id } })).balance.toNumber()).toBe(0)
      expect(await prisma.projectShare.count({ where: { projectId: pid, status: 'SOLD' } })).toBe(2)
      expect((await prisma.project.findUniqueOrThrow({ where: { id: pid } })).status).toBe('FUNDED')
    })
    it('does not mark FUNDED while other reservations still pending', async () => {
      const pid = await newProject(3)
      const u1 = await makeUser(prisma, 'INVESTOR', 'f1'); const u2 = await makeUser(prisma, 'INVESTOR', 'f2')
      const t1 = (await loginAs(call, u1.email)).accessToken; const t2 = (await loginAs(call, u2.email)).accessToken
      const r1 = await call('POST', '/investments/reservations', { token: t1, body: { projectId: pid, shareCount: 2 } })
      await call('POST', '/investments/reservations', { token: t2, body: { projectId: pid, shareCount: 1 } })
      const c = await call('POST', '/investments/confirm', { token: t1, body: { reservationId: r1.json.id, paymentMethod: 'SANDBOX', acceptContract: true } })
      expect(c.status).toBe(201)
      expect((await prisma.project.findUniqueOrThrow({ where: { id: pid } })).status).toBe('FUNDING')
    })
    it('withdrawal cannot overdraw even with concurrent requests', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'w')
      await prisma.wallet.update({ where: { userId: u.id }, data: { balance: 150 } })
      const t = (await loginAs(call, u.email)).accessToken
      const rs = await Promise.all([1, 2, 3].map(() => call('POST', '/investments/wallet/withdraw', { token: t, body: { amount: 100 } })))
      expect(rs.filter((r) => r.status === 201).length).toBe(1)
      const w = await prisma.wallet.findUniqueOrThrow({ where: { userId: u.id } })
      expect(w.balance.toNumber()).toBe(50)
      expect(w.lockedBalance.toNumber()).toBe(100)
    })
  })

  describe('auth tokens & reset', () => {
    it('refresh rotates, stores hashes, detects reuse, rejects forged/suspended', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'a')
      const l = await loginAs(call, u.email)
      const sessions = await prisma.session.findMany({ where: { userId: u.id } })
      expect(sessions.every((s) => s.token !== l.refreshToken)).toBe(true)
      const r1 = await call('POST', '/auth/refresh', { body: { refreshToken: l.refreshToken } })
      expect(r1.status).toBe(200)
      expect(r1.json.refreshToken).not.toBe(l.refreshToken)
      expect((await call('POST', '/auth/refresh', { body: { refreshToken: 'garbage' } })).status).toBe(401)
      // reuse of old token => rejected and whole family revoked
      expect((await call('POST', '/auth/refresh', { body: { refreshToken: l.refreshToken } })).status).toBe(401)
      expect((await call('POST', '/auth/refresh', { body: { refreshToken: r1.json.refreshToken } })).status).toBe(401)
    })
    it('refresh works from the httpOnly cookie; suspended user cannot refresh', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'ck')
      const res = await call('POST', '/auth/login', { body: { email: u.email, password: PASSWORD } })
      const cookies = (res.headers as any).getSetCookie().map((c: string) => c.split(';')[0]).join('; ')
      const r = await call('POST', '/auth/refresh', { cookie: cookies, body: {} })
      expect(r.status).toBe(200)
      await prisma.user.update({ where: { id: u.id }, data: { status: 'SUSPENDED' } })
      expect((await call('POST', '/auth/refresh', { body: { refreshToken: r.json.refreshToken } })).status).toBe(401)
    })
    it('refresh concurrency: only one of two parallel uses succeeds', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'par')
      const l = await loginAs(call, u.email)
      const rs = await Promise.all([1, 2].map(() => call('POST', '/auth/refresh', { body: { refreshToken: l.refreshToken } })))
      expect(rs.filter((r) => r.status === 200).length).toBeLessThanOrEqual(1)
    })
    it('forgot/reset: emails link, stores only a hash, single use, revokes sessions', async () => {
      const u = await makeUser(prisma, 'INVESTOR', 'pw')
      const l = await loginAs(call, u.email)
      mails.length = 0
      expect((await call('POST', '/auth/forgot-password', { body: { email: u.email } })).status).toBe(200)
      expect(mails.length).toBe(1)
      const token = mails[0].text.match(/token=([^\s]+)/)![1]
      const stored = JSON.stringify((await prisma.systemSetting.findUniqueOrThrow({ where: { key: `reset:${u.id}` } })).value)
      expect(stored.includes(token.split('.')[1])).toBe(false)
      expect((await call('POST', '/auth/reset-password', { body: { token: `${u.id}.wrong`, newPassword: 'NewPass12345' } })).status).toBe(400)
      expect((await call('POST', '/auth/reset-password', { body: { token, newPassword: 'NewPass12345' } })).status).toBe(200)
      expect((await call('POST', '/auth/reset-password', { body: { token, newPassword: 'Another12345' } })).status).toBe(400)
      expect((await call('POST', '/auth/refresh', { body: { refreshToken: l.refreshToken } })).status).toBe(401)
      expect((await call('POST', '/auth/login', { body: { email: u.email, password: PASSWORD } })).status).toBe(401)
      expect((await call('POST', '/auth/login', { body: { email: u.email, password: 'NewPass12345' } })).status).toBe(200)
      // unknown email: same response, no mail
      mails.length = 0
      expect((await call('POST', '/auth/forgot-password', { body: { email: 'nobody@test.local' } })).status).toBe(200)
      expect(mails.length).toBe(0)
    })
    it('profile update rejects email already used by someone else', async () => {
      const a = await makeUser(prisma, 'INVESTOR', 'pa'); const b = await makeUser(prisma, 'INVESTOR', 'pb')
      const t = (await loginAs(call, a.email)).accessToken
      expect((await call('PATCH', '/auth/me', { token: t, body: { email: b.email } })).status).toBe(409)
    })
  })

  describe('financial single-shot operations', () => {
    it('expense approval and journal reversal cannot run twice concurrently', async () => {
      const fm = await makeUser(prisma, 'FINANCE_MANAGER', 'fin')
      const t = (await loginAs(call, fm.email)).accessToken
      const exp = await prisma.ledgerAccount.create({ data: { code: `5${randomBytes(3).toString('hex')}`, name: 'exp', type: 'EXPENSE' as any } as any })
      await prisma.ledgerAccount.create({ data: { code: `2${randomBytes(3).toString('hex')}`, name: 'pay', type: 'LIABILITY' as any } as any })
      const e = await prisma.expense.create({ data: { accountId: exp.id, amount: 100, category: 'FEED', expenseDate: new Date(), createdBy: fm.id } as any })
      const rs = await Promise.all([1, 2].map(() => call('POST', `/financial/expenses/${e.id}/approve`, { token: t, body: { action: 'APPROVED' } })))
      expect(rs.map((r) => r.status).sort()).toEqual([201, 400])
      expect(await prisma.journalEntry.count({ where: { referenceType: 'EXPENSE', referenceId: e.id } })).toBe(1)
      // rejected expense cannot then be approved
      const e2 = await prisma.expense.create({ data: { accountId: exp.id, amount: 5, category: 'FEED', expenseDate: new Date(), createdBy: fm.id } as any })
      expect((await call('POST', `/financial/expenses/${e2.id}/approve`, { token: t, body: { action: 'REJECTED', comment: 'no' } })).status).toBe(201)
      expect((await call('POST', `/financial/expenses/${e2.id}/approve`, { token: t, body: { action: 'APPROVED' } })).status).toBe(400)

      const je = await call('POST', '/financial/journal-entries', { token: t, body: {
        date: new Date().toISOString(), description: 'test entry',
        entries: [{ accountId: exp.id, type: 'DEBIT', amount: 10 }, { accountId: exp.id, type: 'CREDIT', amount: 10 }],
      } })
      expect(je.status).toBe(201)
      const rv = await Promise.all([1, 2].map(() => call('POST', `/financial/journal-entries/${je.json.id}/reverse`, { token: t, body: { reason: 'oops' } })))
      expect(rv.map((r) => r.status).sort()).toEqual([201, 400])
      expect(await prisma.journalEntry.count({ where: { referenceType: 'REVERSAL', referenceId: je.json.id } })).toBe(1)
    })
  })
})
