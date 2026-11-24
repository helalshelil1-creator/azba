import { PrismaClient } from '@prisma/client'
import { bootApp, client, makeUser, loginAs } from './helpers'

describe('support & notifications access (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any
  let call: ReturnType<typeof client>
  let owner: string, other: string, viewer: string, agent: string, ticketId: string, ownerId: string

  beforeAll(async () => {
    const b = await bootApp(); app = b.app; call = client(b.base)
    const u1 = await makeUser(prisma, 'INVESTOR'); const u2 = await makeUser(prisma, 'INVESTOR')
    const u3 = await makeUser(prisma, 'VIEWER'); const u4 = await makeUser(prisma, 'SUPPORT_AGENT')
    ownerId = u1.id
    owner = (await loginAs(call, u1.email)).accessToken
    other = (await loginAs(call, u2.email)).accessToken
    viewer = (await loginAs(call, u3.email)).accessToken
    agent = (await loginAs(call, u4.email)).accessToken
    const t = await call('POST', '/support/tickets', { token: owner, body: { subject: 'Hello there', description: 'Need help with something' } })
    ticketId = t.json.id
  })
  afterAll(async () => { await prisma.supportTicket.deleteMany({ where: { userId: ownerId } }); await app.close(); await prisma.$disconnect() })

  it('non-owners (including non-investor roles) cannot read, reply, resolve or close', async () => {
    for (const tok of [other, viewer]) {
      expect((await call('GET', `/support/tickets/${ticketId}`, { token: tok })).status).toBe(403)
      expect((await call('POST', `/support/tickets/${ticketId}/reply`, { token: tok, body: { message: 'x' } })).status).toBe(403)
      expect((await call('POST', `/support/tickets/${ticketId}/resolve`, { token: tok })).status).toBe(403)
      expect((await call('POST', `/support/tickets/${ticketId}/close`, { token: tok, body: { rating: 1 } })).status).toBe(403)
    }
  })

  it('internal staff notes are hidden from the owner; owner reply does not count as first response', async () => {
    expect((await call('POST', `/support/tickets/${ticketId}/reply`, { token: owner, body: { message: 'more info', isInternal: true } })).status).toBe(201)
    let t = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } })
    expect(t.firstResponseAt).toBeNull()
    await call('POST', `/support/tickets/${ticketId}/reply`, { token: agent, body: { message: 'secret note', isInternal: true } })
    t = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } })
    expect(t.firstResponseAt).toBeNull()
    await call('POST', `/support/tickets/${ticketId}/reply`, { token: agent, body: { message: 'public answer' } })
    t = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } })
    expect(t.firstResponseAt).not.toBeNull()
    const own = await call('GET', `/support/tickets/${ticketId}`, { token: owner })
    const bodies = own.json.messages.map((m: any) => m.body)
    expect(bodies).toContain('public answer')
    expect(bodies).not.toContain('secret note')
    expect(bodies).toContain('more info')
    const staff = await call('GET', `/support/tickets/${ticketId}`, { token: agent })
    expect(staff.json.messages.map((m: any) => m.body)).toContain('secret note')
  })

  it('rating must be 1..5', async () => {
    expect((await call('POST', `/support/tickets/${ticketId}/close`, { token: owner, body: { rating: 9 } })).status).toBe(400)
    expect((await call('POST', `/support/tickets/${ticketId}/close`, { token: owner, body: { rating: 5 } })).status).toBe(201)
  })

  it('notifications: users only see/mark their own; send/stats are admin only', async () => {
    const n = await prisma.notification.create({ data: { userId: ownerId, type: 'SYSTEM' as any, title: 't', message: 'm', channels: ['IN_APP'] } as any })
    expect((await call('GET', '/notifications', { token: other })).json.data.length).toBe(0)
    await call('PATCH', `/notifications/${n.id}/read`, { token: other })
    expect((await prisma.notification.findUniqueOrThrow({ where: { id: n.id } })).readAt).toBeNull()
    expect((await call('GET', '/notifications/stats', { token: owner })).status).toBe(403)
    expect((await call('GET', '/notifications', { token: owner })).json.data.length).toBe(1)
  })
})
