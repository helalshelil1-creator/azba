import { bootApp, client } from './helpers'

describe('rate limiting', () => {
  let app: any
  let call: ReturnType<typeof client>
  beforeAll(async () => { const b = await bootApp({ throttle: true }); app = b.app; call = client(b.base) })
  afterAll(async () => { await app.close() })

  it('normal routes are not capped at the auth limit (30 requests all pass)', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 30; i++) statuses.push((await call('GET', '/health-not-here')).status)
    expect(statuses.includes(429)).toBe(false)
  })
  it('auth routes are limited to 10/min', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 13; i++) {
      statuses.push((await call('POST', '/auth/login', { body: { email: 'x@test.local', password: 'whatever12A' } })).status)
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true)
    expect(statuses.slice(10).every((s) => s === 429)).toBe(true)
  })
})
