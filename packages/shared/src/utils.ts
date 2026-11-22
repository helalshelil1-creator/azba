import { z } from 'zod'
import { ERROR_CODES } from './errors'

// ---------- Validation schemas ----------
export const emailSchema = z.string().email().max(255).trim().toLowerCase()
export const passwordSchema = z.string().min(8).max(128)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
export const phoneSchema = z.string().regex(/^(\+?2)?01[0-9]{9}$/, 'Invalid Egyptian phone number')
export const uuidSchema = z.string().uuid()
export const decimalSchema = z.number().or(z.string())
export const dateSchema = z.string().datetime().or(z.date())
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
})

// ---------- Money ----------
export function roundMoney(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function formatMoney(value: number, currency = 'EGP', locale = 'ar-EG'): string {
  const symbols: Record<string, string> = { EGP: 'ج.م', USD: '$', SAR: 'ر.س' }
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return locale.startsWith('ar') ? `${formatted} ${symbols[currency] || currency}` : `${formatted} ${currency}`
}

export function formatNumber(value: number, locale = 'ar-EG'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatPercent(value: number, locale = 'ar-EG'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value) + '٪'
}

export function formatDate(date: Date | string, locale = 'ar-EG'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}

export function formatDateTime(date: Date | string, locale = 'ar-EG'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(d)
}

// ---------- Dates ----------
export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

// ---------- IDs & codes ----------
export function generateCode(prefix: string, length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return `${prefix}-${result}`
}

export function generateNumericCode(length = 10): string {
  let result = ''
  for (let i = 0; i < length; i++) result += Math.floor(Math.random() * 10)
  return result
}

// ---------- Security ----------
export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim()
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-3)
}

// ---------- Arrays ----------
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    acc[k] = acc[k] || []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

export function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return sum(arr) / arr.length
}

// ---------- Async ----------
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 1000): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try { return await fn() } catch (e) { lastError = e }
    if (i < attempts - 1) await sleep(delay * Math.pow(2, i))
  }
  throw lastError
}

// ---------- URLs ----------
export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}
