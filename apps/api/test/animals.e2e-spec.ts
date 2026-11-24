import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { bootApp, client, makeUser, loginAs } from './helpers'

describe('animals (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any
  let call: ReturnType<typeof client>
  let farmId: string, penA: string, penB: string, animalId: string
  let admin: string, vet: string, investor: string, vetId: string
  const hex = () => randomBytes(3).toString('hex')

  beforeAll(async () => {
    const b = await bootApp(); app = b.app; call = client(b.base)
    const farm = await prisma.farm.create({ data: { name: 'F', code: `F-${hex()}`, address: 'a', city: 'c', governorate: 'g' } as any })
    farmId = farm.id
    const mk = (n: string) => prisma.pen.create({ data: { name: n, code: `PEN-${hex()}`, farmId, capacity: 5, currentCount: 0 } as any })
    penA = (await mk('A')).id; penB = (await mk('B')).id
    const a = await prisma.animal.create({ data: { farmId, animalId: `AN-${hex()}`, type: 'BEEF_CATTLE', breed: 'b', penId: penA } as any })
    animalId = a.id
    await prisma.pen.update({ where: { id: penA }, data: { currentCount: 1 } })
    const u1 = await makeUser(prisma, 'ADMIN'); const u2 = await makeUser(prisma, 'VETERINARIAN'); const u3 = await makeUser(prisma, 'INVESTOR')
    vetId = u2.id
    admin = (await loginAs(call, u1.email)).accessToken
    vet = (await loginAs(call, u2.email)).accessToken
    investor = (await loginAs(call, u3.email)).accessToken
  })
  afterAll(async () => {
    await prisma.farm.deleteMany({ where: { id: farmId } })
    await app.close(); await prisma.$disconnect()
  })
  const count = async (id: string) => (await prisma.pen.findUniqueOrThrow({ where: { id } })).currentCount

  it('investor cannot read internal animal records; staff can', async () => {
    expect((await call('GET', `/animals/${animalId}`, { token: investor })).status).toBe(403)
    expect((await call('GET', `/animals/${animalId}`, { token: vet })).status).toBe(200)
  })

  it('transfer to the same pen is rejected, to another pen moves the count once', async () => {
    expect((await call('POST', `/animals/${animalId}/transfer`, { token: admin, body: { penId: penA, reason: 'x' } })).status).toBe(400)
    expect(await count(penA)).toBe(1)
    expect((await call('POST', `/animals/${animalId}/transfer`, { token: admin, body: { penId: penB, reason: 'x' } })).status).toBe(201)
    expect([await count(penA), await count(penB)]).toEqual([0, 1])
  })

  it('death is recorded once and frees the pen exactly once', async () => {
    const body = { date: new Date().toISOString(), cause: 'c' }
    expect((await call('POST', `/animals/${animalId}/death`, { token: admin, body })).status).toBe(201)
    expect((await call('POST', `/animals/${animalId}/death`, { token: admin, body })).status).toBe(400)
    expect(await count(penB)).toBe(0)
    expect((await call('POST', `/animals/${animalId}/transfer`, { token: admin, body: { penId: penA, reason: 'x' } })).status).toBe(400)
  })

  it('concurrent vet report approvals create a single new version', async () => {
    const rep = await prisma.veterinaryReport.create({ data: { animalId, veterinarianId: vetId, reportNumber: `R-${hex()}`, examinationDate: new Date() } as any })
    const rs = await Promise.all([1, 2, 3].map(() => call('PATCH', `/animals/vet-reports/${rep.id}/approve`, { token: vet })))
    expect(rs.filter((r) => r.status === 200).length).toBe(1)
    expect(await prisma.veterinaryReport.count({ where: { previousVersionId: rep.id } })).toBe(1)
  })

  it('malformed death/feeding payloads give 400, not 500', async () => {
    const a2 = await prisma.animal.create({ data: { farmId, animalId: `AN-${hex()}`, type: 'BEEF_CATTLE', breed: 'b' } as any })
    expect((await call('POST', `/animals/${a2.id}/death`, { token: admin, body: { date: 'not-a-date', cause: 'x' } })).status).toBe(400)
    expect((await prisma.animal.findUniqueOrThrow({ where: { id: a2.id } })).status).not.toBe('DECEASED')
    expect((await call('POST', '/animals/feeding', { token: admin, body: {} })).status).toBe(400)
    expect((await call('POST', '/animals/feeding', { token: admin, body: { animalId: a2.id, feedTypeId: a2.id, quantity: -3 } })).status).toBe(400)
  })
})
