import { ConfigService } from '@nestjs/config'
import { RolesGuard } from '../src/common/guards/roles.guard'
import { getAccessSecret, getRefreshSecret } from '../src/common/config/secrets'
import { Reflector } from '@nestjs/core'

function ctx(role: string, roles: string[]) {
  const reflector = { getAllAndOverride: () => roles } as unknown as Reflector
  const guard = new RolesGuard(reflector)
  const c: any = { getHandler: () => null, getClass: () => null, switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }) }
  return () => guard.canActivate(c)
}

describe('RolesGuard', () => {
  it('only listed roles and SUPER_ADMIN pass', () => {
    const list = ['ADMIN', 'FINANCE_MANAGER']
    expect(ctx('FINANCE_MANAGER', list)()).toBe(true)
    expect(ctx('SUPER_ADMIN', list)()).toBe(true)
    for (const r of ['INVESTMENT_MANAGER', 'SUPPORT_MANAGER', 'ACCOUNTANT', 'INVESTOR', 'VIEWER']) {
      expect(ctx(r, list)).toThrow()
    }
  })
})

describe('JWT secrets', () => {
  const cfg = (v: Record<string, string>) => ({ get: (k: string) => v[k] }) as unknown as ConfigService
  const env = process.env.NODE_ENV
  afterAll(() => { (process.env as any).NODE_ENV = env })
  it('production refuses missing or short secrets', () => {
    ;(process.env as any).NODE_ENV = 'production'
    expect(() => getAccessSecret(cfg({}))).toThrow()
    expect(() => getRefreshSecret(cfg({ JWT_REFRESH_SECRET: 'short' }))).toThrow()
    expect(getAccessSecret(cfg({ JWT_SECRET: 'x'.repeat(40) }))).toBe('x'.repeat(40))
  })
  it('dev fallback is never the old public default', () => {
    ;(process.env as any).NODE_ENV = 'test'
    expect(getAccessSecret(cfg({}))).not.toBe('dev-secret-change-me')
  })
})
