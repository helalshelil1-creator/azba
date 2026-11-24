import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { bootApp, client, makeUser, loginAs } from './helpers'

describe('ledger journal entries (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any, call: ReturnType<typeof client>, token: string, a: string, b: string
  const hex = () => randomBytes(3).toString('hex')
  beforeAll(async () => {
    const x = await bootApp(); app = x.app; call = client(x.base)
    token = (await loginAs(call, (await makeUser(prisma, 'FINANCE_MANAGER')).email)).accessToken
    a = (await prisma.ledgerAccount.create({ data: { code: `T${hex()}`, name: 'a', type: 'ASSET', subType: 'CURRENT_ASSET' } as any })).id
    b = (await prisma.ledgerAccount.create({ data: { code: `T${hex()}`, name: 'b', type: 'REVENUE', subType: 'OPERATING_REVENUE' } as any })).id
  })
  afterAll(async () => { await prisma.journalEntry.deleteMany({ where: { description: 'ledger-test' } }); await prisma.ledgerAccount.deleteMany({ where: { id: { in: [a, b] } } }); await app.close(); await prisma.$disconnect() })
  const post = (entries: any[]) => call('POST', '/financial/journal-entries', { token, body: { date: new Date().toISOString(), description: 'ledger-test', entries } })

  it('balances in cents (0.1 + 0.2 = 0.3) and rejects off-by-a-cent', async () => {
    const ok = await post([
      { accountId: a, type: 'DEBIT', amount: 0.1 }, { accountId: a, type: 'DEBIT', amount: 0.2 }, { accountId: b, type: 'CREDIT', amount: 0.3 },
    ])
    expect(ok.status).toBe(201)
    expect(Number(ok.json.totalDebit)).toBe(0.3)
    expect((await post([{ accountId: a, type: 'DEBIT', amount: 10.01 }, { accountId: b, type: 'CREDIT', amount: 10 }])).status).toBe(400)
  })
  it('cannot post to a deactivated account', async () => {
    await prisma.ledgerAccount.update({ where: { id: b }, data: { isActive: false } })
    expect((await post([{ accountId: a, type: 'DEBIT', amount: 5 }, { accountId: b, type: 'CREDIT', amount: 5 }])).status).toBe(400)
  })
})
