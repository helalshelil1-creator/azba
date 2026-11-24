import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { bootApp, client, makeUser, loginAs } from './helpers'

describe('projects/farms (real DB)', () => {
  const prisma = new PrismaClient()
  let app: any
  let call: ReturnType<typeof client>
  let farmId: string
  let token: string
  const projects: string[] = []

  beforeAll(async () => {
    const b = await bootApp()
    app = b.app
    call = client(b.base)
    const farm = await prisma.farm.create({
      data: { name: 'F', code: `F-${randomBytes(3).toString('hex')}`, address: 'a', city: 'c', governorate: 'g' } as any,
    })
    farmId = farm.id
    const u = await makeUser(prisma, 'INVESTMENT_MANAGER')
    token = (await loginAs(call, u.email)).accessToken
  })
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { id: { in: projects } } })
    await prisma.farm.deleteMany({ where: { id: farmId } })
    await app.close(); await prisma.$disconnect()
  })

  const body = (shares: number) => ({
    farmId, name: 'Project X', animalType: 'BEEF_CATTLE', breed: 'b', purpose: 'FATTENING',
    totalShares: shares, sharePrice: 100, totalBudget: shares * 100,
  })

  it('two projects can be created (share numbers do not collide)', async () => {
    const a = await call('POST', '/projects', { token, body: body(3) })
    const b = await call('POST', '/projects', { token, body: body(3) })
    if (a.status !== 201) console.log(JSON.stringify(a.json)); expect([a.status, b.status]).toEqual([201, 201])
    projects.push(a.json.id, b.json.id)
  })

  it('draft projects are hidden from the public detail route', async () => {
    const id = projects[0]
    expect((await call('GET', `/projects/${id}`)).status).toBe(404)
    await prisma.project.update({ where: { id }, data: { status: 'FUNDING' } })
    expect((await call('GET', `/projects/${id}`)).status).toBe(200)
  })

  it('changing totalShares on a draft keeps shares and amounts consistent', async () => {
    const id = projects[1]
    const r = await call('PATCH', `/projects/${id}`, { token, body: { totalShares: 5 } })
    expect(r.status).toBe(200)
    const p = await prisma.project.findUniqueOrThrow({ where: { id } })
    expect(p.totalShares).toBe(5)
    expect(p.availableShares).toBe(5)
    expect(Number(p.targetAmount)).toBe(500)
    expect(await prisma.projectShare.count({ where: { projectId: id } })).toBe(5)
  })

  it('public farm detail does not expose manager email/phone', async () => {
    const m = await makeUser(prisma, 'FARM_MANAGER')
    await prisma.farm.update({ where: { id: farmId }, data: { managerId: m.id } as any })
    const r = await call('GET', `/farms/${farmId}`)
    expect(r.status).toBe(200)
    expect(r.json.manager.email).toBeUndefined()
    expect(r.json.manager.phone).toBeUndefined()
  })
})
