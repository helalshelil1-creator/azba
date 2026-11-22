'use client'

import React from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP, formatNumber } from '@/lib/utils'

export { formatNumber }

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('azba_access_token')
  } catch {
    return null
  }
}

/**
 * POST that tolerates the API's `forbidNonWhitelisted` validation.
 * If the server rejects unknown keys, they are stripped and the request retried.
 */
export async function postTolerant<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  let payload: Record<string, unknown> = { ...body }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await http.post<T>(path, payload, {}, getToken)
    } catch (e: any) {
      const msg = String(e?.message || '')
      const extra = Array.from(msg.matchAll(/property\s+([A-Za-z0-9_]+)\s+should not exist/g)).map((m) => m[1])
      if (e?.status === 400 && extra.length > 0) {
        let changed = false
        extra.forEach((k) => {
          if (k in payload) {
            delete payload[k]
            changed = true
          }
        })
        if (changed) continue
      }
      throw e
    }
  }
  throw new Error('تعذر إرسال الطلب بعد تعديل الحقول')
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Meta {
  page: number
  limit: number
  total: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface Paged<T> {
  data: T[]
  meta?: Meta
}

export interface Farm {
  id: string
  name: string
  code: string
  nameEn?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  governorate?: string | null
  country?: string | null
  totalArea?: number | string | null
  usableArea?: number | string | null
  status?: string | null
  licenseNumber?: string | null
  manager?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  } | null
  buildings?: Building[]
  pens?: Pen[]
  animals?: Animal[]
  _count?: {
    animals?: number
    pens?: number
    buildings?: number
    projects?: number
    employees?: number
  }
}

export interface Building {
  id: string
  name: string
  code: string
  type?: string | null
  area?: number | string | null
  capacity?: number | null
  description?: string | null
  _count?: { pens?: number }
}

export interface Pen {
  id: string
  name: string
  code: string
  type?: string | null
  capacity?: number | null
  currentCount?: number
  area?: number | string | null
  floorType?: string | null
  buildingId?: string | null
  status?: string | null
  _count?: { animals?: number }
}

export interface WeightRecord {
  id: string
  weight?: number | string | null
  method?: string | null
  recordedAt?: string | null
  notes?: string | null
}

export interface HealthRecord {
  id: string
  recordType?: string | null
  title?: string | null
  description?: string | null
  diagnosis?: string | null
  treatment?: string | null
  cost?: number | string | null
  startDate?: string | null
  followUpDate?: string | null
}

export interface Vaccination {
  id: string
  vaccineName?: string | null
  vaccineType?: string | null
  manufacturer?: string | null
  batchNumber?: string | null
  administeredAt?: string | null
  nextDueDate?: string | null
  cost?: number | string | null
}

export interface Animal {
  id: string
  animalId: string
  tagNumber?: string | null
  qrCode?: string | null
  type?: string | null
  breed?: string | null
  breedEn?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  ageMonths?: number | null
  weight?: number | string | null
  purchaseWeight?: number | string | null
  purchasePrice?: number | string | null
  purchaseDate?: string | null
  healthStatus?: string | null
  status?: string | null
  location?: string | null
  notes?: string | null
  farm?: {
    id?: string
    name?: string
    code?: string
    city?: string
    governorate?: string
  } | null
  pen?: { id?: string; name?: string; code?: string } | null
  project?: { id?: string; name?: string; code?: string; status?: string } | null
  media?: { id?: string; type?: string; url?: string; isPrimary?: boolean }[]
  weightRecords?: WeightRecord[]
  healthRecords?: HealthRecord[]
  vaccinations?: Vaccination[]
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const FARM_STATUS: Record<string, { ar: string; cls: string }> = {
  ACTIVE: { ar: 'نشطة', cls: 'badge-success' },
  INACTIVE: { ar: 'غير نشطة', cls: 'badge-default' },
  SUSPENDED: { ar: 'موقوفة', cls: 'badge-warning' },
}

export const BUILDING_TYPE: Record<string, { ar: string; cls: string }> = {
  PEN: { ar: 'حظيرة', cls: 'badge-default' },
  STORAGE: { ar: 'مخزن', cls: 'badge-default' },
  OFFICE: { ar: 'مكتب', cls: 'badge-info' },
  VET_CLINIC: { ar: 'عيادة بيطرية', cls: 'badge-gold' },
  FEED_MILL: { ar: 'مصنع علف', cls: 'badge-default' },
  OTHER: { ar: 'أخرى', cls: 'badge-default' },
}

export const PEN_TYPE: Record<string, { ar: string; cls: string }> = {
  FATTENING: { ar: 'تسمين', cls: 'badge-gold' },
  DAIRY: { ar: 'حلاب', cls: 'badge-info' },
  BREEDING: { ar: 'تربية', cls: 'badge-success' },
  QUARANTINE: { ar: 'حجر صحي', cls: 'badge-warning' },
  ISOLATION: { ar: 'عزل', cls: 'badge-danger' },
  CALVING: { ar: 'ولادة', cls: 'badge-default' },
}

export const FLOOR_TYPE: Record<string, string> = {
  CONCRETE: 'خرساني',
  TILE: 'بلاط',
  DIRT: 'ترابي',
  SLATS: 'قضبان',
  OTHER: 'أخرى',
}

export const ANIMAL_TYPE: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة',
  BEEF_CATTLE: 'أبقار لحم',
  BUFFALO: 'جاموس',
  GOAT: 'ماعز',
  SHEEP: 'أغنام',
  POULTRY: 'دواجن',
  FISH: 'أسماك',
  OTHER: 'أخرى',
}

export const GENDER: Record<string, string> = {
  MALE: 'ذكر',
  FEMALE: 'أنثى',
}

export const HEALTH_STATUS: Record<string, { ar: string; cls: string }> = {
  HEALTHY: { ar: 'سليم', cls: 'badge-success' },
  SICK: { ar: 'مريض', cls: 'badge-warning' },
  UNDER_TREATMENT: { ar: 'تحت العلاج', cls: 'badge-gold' },
  QUARANTINE: { ar: 'حجر صحي', cls: 'badge-warning' },
  CRITICAL: { ar: 'حرج', cls: 'badge-danger' },
  DECEASED: { ar: 'متوفى', cls: 'badge-danger' },
}

export const ANIMAL_STATUS: Record<string, { ar: string; cls: string }> = {
  ACTIVE: { ar: 'نشط', cls: 'badge-success' },
  SOLD: { ar: 'مباع', cls: 'badge-default' },
  DEAD: { ar: 'متوفى', cls: 'badge-danger' },
  DECEASED: { ar: 'متوفى', cls: 'badge-danger' },
  TRANSFERRED: { ar: 'منقول', cls: 'badge-info' },
  QUARANTINE: { ar: 'حجر صحي', cls: 'badge-warning' },
}

export const HEALTH_RECORD_TYPE: Record<string, { ar: string; cls: string }> = {
  EXAMINATION: { ar: 'فحص', cls: 'badge-info' },
  VACCINATION: { ar: 'لقاح', cls: 'badge-gold' },
  MEDICATION: { ar: 'دواء', cls: 'badge-warning' },
  TREATMENT: { ar: 'علاج', cls: 'badge-warning' },
  SURGERY: { ar: 'جراحة', cls: 'badge-danger' },
  LAB_TEST: { ar: 'تحليل', cls: 'badge-default' },
  CHECKUP: { ar: 'متابعة', cls: 'badge-success' },
}

export const WEIGHT_METHOD: Record<string, string> = {
  SCALE: 'ميزان',
  ESTIMATE: 'تقدير',
  TAPE: 'شريط قياس',
  OTHER: 'أخرى',
}

export const ANIMAL_TYPE_OPTIONS = Object.entries(ANIMAL_TYPE).map(([value, label]) => ({ value, label }))
export const BUILDING_TYPE_OPTIONS = Object.entries(BUILDING_TYPE).map(([value, { ar }]) => ({ value, label: ar }))
export const PEN_TYPE_OPTIONS = Object.entries(PEN_TYPE).map(([value, { ar }]) => ({ value, label: ar }))
export const FLOOR_TYPE_OPTIONS = Object.entries(FLOOR_TYPE).map(([value, label]) => ({ value, label }))
export const HEALTH_RECORD_TYPE_OPTIONS = Object.entries(HEALTH_RECORD_TYPE).map(([value, { ar }]) => ({ value, label: ar }))
export const WEIGHT_METHOD_OPTIONS = Object.entries(WEIGHT_METHOD).map(([value, label]) => ({ value, label }))

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function money(value: unknown): string {
  return formatEGP(num(value))
}

export function qty(value: unknown): string {
  return formatNumber(num(value))
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}

export function formatAge(months?: number | null, dateOfBirth?: string | null): string {
  let m = months ?? 0
  if (!m && dateOfBirth) {
    const d = new Date(dateOfBirth)
    if (!Number.isNaN(d.getTime())) {
      m = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    }
  }
  if (!m) return '—'
  if (m < 12) return `${formatNumber(m)} شهر`
  const years = Math.floor(m / 12)
  const rest = m % 12
  if (!rest) return `${formatNumber(years)} سنة`
  return `${formatNumber(years)} سنة و ${formatNumber(rest)} شهر`
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function Loading({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
      <p className="mt-3 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4 text-sm">
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-ivory/40 px-6 py-12 text-center">
      <Inbox className="h-10 w-10 text-primary/20" />
      <p className="text-sm font-semibold text-primary">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('card', className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

export function StatusBadge({ value, map }: { value?: string | null; map: Record<string, { ar: string; cls: string }> }) {
  const key = (value ?? '').toUpperCase()
  const info = map[key] ?? { ar: value || '—', cls: 'badge-default' }
  return <span className={cn('badge', info.cls)}>{info.ar}</span>
}

export function Tag({ value, map }: { value?: string | null; map: Record<string, string> }) {
  const key = (value ?? '').toUpperCase()
  return <span className="badge badge-default">{map[key] ?? value ?? '—'}</span>
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ivory">
      <div
        className={cn('h-full rounded-full', pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-primary')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
