import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { randomBytes } from 'crypto'

/**
 * End-to-end acceptance tests for the core investor journey and security.
 * Requires the PostgreSQL database to be running and seeded.
 */
describe('AZBA API (e2e)', () => {
  let app: INestApplication
  let baseUrl: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api', { exclude: ['health'] })
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    await app.listen(0)
    const url = await app.getUrl()
    baseUrl = url.replace('[::1]', '127.0.0.1').replace('127.0.0.1', 'localhost')
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /health returns ok', async () => {
    const res = await fetch(`${baseUrl}/health`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.database).toBe('up')
  })

  it('GET /api/projects is public', async () => {
    const res = await fetch(`${baseUrl}/api/projects?page=1&limit=5`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta).toBeDefined()
  })

  it('rejects protected routes without a token', async () => {
    const res = await fetch(`${baseUrl}/api/investments/dashboard`)
    expect(res.status).toBe(401)
  })

  it('logs in the seeded admin', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@azba.com', password: 'Admin@12345' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.user.role).toBe('SUPER_ADMIN')
  })

  it('completes the investor journey: register -> reserve -> confirm -> wallet', async () => {
    const suffix = randomBytes(4).toString('hex')
    const email = `e2e+${suffix}@example.com`

    // 1) Register
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'Test@12345',
        firstName: 'Test',
        lastName: 'Investor',
        phone: `0100${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      }),
    })
    expect(reg.status).toBe(201)
    const regBody = await reg.json()
    const token = regBody.accessToken
    expect(token).toBeDefined()

    // 2) Browse public projects
    const projectsRes = await fetch(`${baseUrl}/api/projects?page=1&limit=10`)
    const projects = await projectsRes.json()
    const project = projects.data.find((p: any) => p.status === 'FUNDING' || p.status === 'FUNDED')
    expect(project).toBeDefined()

    // 3) Reserve shares
    const reserveRes = await fetch(`${baseUrl}/api/investments/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ projectId: project.id, shareCount: 1 }),
    })
    expect(reserveRes.status).toBe(201)
    const reservation = await reserveRes.json()
    expect(reservation.status).toBe('PENDING')

    // 4) Confirm investment (sandbox payment)
    const confirmRes = await fetch(`${baseUrl}/api/investments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reservationId: reservation.id,
        paymentMethod: 'SANDBOX',
        acceptContract: true,
      }),
    })
    expect(confirmRes.status).toBe(201)
    const investment = await confirmRes.json()
    expect(investment.contractNumber).toBeDefined()
    expect(investment.shareCount).toBe(1)

    // 5) Portfolio reflects the investment
    const dashRes = await fetch(`${baseUrl}/api/investments/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(dashRes.status).toBe(200)
    const dash = await dashRes.json()
    expect(dash.stats.totalShares).toBeGreaterThanOrEqual(1)
    expect(dash.investments.length).toBeGreaterThanOrEqual(1)
  })
})
