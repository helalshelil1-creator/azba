import { PrismaClient } from '@prisma/client'
import http from 'http'
import './helpers'
import { makeUser, PASSWORD } from './helpers'

describe('vercel serverless shim', () => {
  const prisma = new PrismaClient()
  let server: http.Server, base: string
  beforeAll(async () => {
    const { default: handler } = await import('../src/vercel-entry')
    server = http.createServer((req, res) => { handler(req as any, res as any) })
    await new Promise<void>((r) => server.listen(0, r))
    base = `http://localhost:${(server.address() as any).port}`
  })
  afterAll(async () => { server.close(); await prisma.$disconnect() })

  const hit = (route: string, init: any = {}) =>
    fetch(`${base}/api/main`, { ...init, headers: { 'content-type': 'application/json', 'x-azba-route': route, ...(init.headers || {}) } })

  it('routes via x-azba-route, login sets cookies, refresh works from the cookie only', async () => {
    const u = await makeUser(prisma, 'INVESTOR')
    const login = await hit('/auth/login', { method: 'POST', body: JSON.stringify({ email: u.email, password: PASSWORD }) })
    expect(login.status).toBe(200)
    const cookies = (login.headers as any).getSetCookie().map((c: string) => c.split(';')[0])
    const refreshCookie = cookies.find((c: string) => c.startsWith('refresh_token='))
    expect(refreshCookie).toBeTruthy()
    const r = await hit('/auth/refresh', { method: 'POST', body: '{}', headers: { cookie: refreshCookie } })
    expect(r.status).toBe(200)
    expect((await hit('/health')).status).toBeLessThan(500)
  })
})
