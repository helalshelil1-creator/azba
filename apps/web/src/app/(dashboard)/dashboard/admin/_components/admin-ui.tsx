'use client'

import React from 'react'
import { AlertTriangle, Inbox, Loader2, RefreshCw, Search } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  API token helper                                                    */
/* ------------------------------------------------------------------ */
export const getToken = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token')

/* ------------------------------------------------------------------ */
/*  Defensive helpers                                                   */
/* ------------------------------------------------------------------ */
export function toNum(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return (
    d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  )
}

export function fullName(user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  return name || user?.email || '—'
}

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                   */
/* ------------------------------------------------------------------ */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function AdminCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function AdminCardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-base font-bold text-primary">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                           */
/* ------------------------------------------------------------------ */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'text-primary',
  bg = 'bg-primary/5',
}: {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  hint?: string
  tone?: string
  bg?: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className={cn('mt-2 text-xl font-bold sm:text-2xl', tone)}>{value}</div>
          {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
        </div>
        {Icon ? (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bg, tone)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Badges & status maps                                                */
/* ------------------------------------------------------------------ */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'gold' | 'default'

export function StatusBadge({ tone = 'default', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return <span className={cn('badge', `badge-${tone}`)}>{children}</span>
}

export const USER_ROLE_AR: Record<string, string> = {
  SUPER_ADMIN: 'مدير عام',
  ADMIN: 'مدير',
  FINANCE_MANAGER: 'مدير مالية',
  ACCOUNTANT: 'محاسب',
  INVESTMENT_MANAGER: 'مدير استثمار',
  FARM_MANAGER: 'مدير مزرعة',
  FARM_EMPLOYEE: 'موظف مزرعة',
  VETERINARIAN: 'طبيب بيطري',
  SALES_MANAGER: 'مدير مبيعات',
  PROCUREMENT_OFFICER: 'موظف مشتريات',
  CUSTOMER_SUPPORT: 'دعم عملاء',
  SUPPORT_AGENT: 'وكيل دعم',
  SUPPORT_MANAGER: 'مدير دعم',
  INVESTOR: 'مستثمر',
  VIEWER: 'مشاهد',
}

export const USER_STATUS_AR: Record<string, string> = {
  ACTIVE: 'نشط',
  INACTIVE: 'غير نشط',
  SUSPENDED: 'موقوف',
  PENDING_VERIFICATION: 'بانتظار التحقق',
  BLOCKED: 'محظور',
}

export function userStatusTone(status?: string | null): BadgeTone {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'PENDING_VERIFICATION':
      return 'warning'
    case 'SUSPENDED':
    case 'BLOCKED':
      return 'danger'
    default:
      return 'default'
  }
}

export function userRoleTone(role?: string | null): BadgeTone {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'danger'
    case 'ADMIN':
    case 'FINANCE_MANAGER':
    case 'INVESTMENT_MANAGER':
    case 'SUPPORT_MANAGER':
    case 'FARM_MANAGER':
      return 'gold'
    case 'INVESTOR':
      return 'success'
    default:
      return 'default'
  }
}

export const PROJECT_STATUS_AR: Record<string, string> = {
  DRAFT: 'مسودة',
  PENDING_APPROVAL: 'بانتظار الموافقة',
  APPROVED: 'معتمد',
  ACTIVE: 'نشط',
  FUNDING: 'قيد التمويل',
  FUNDED: 'مموّل',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  SUSPENDED: 'موقوف',
}

export function projectStatusTone(status?: string | null): BadgeTone {
  switch (status) {
    case 'ACTIVE':
    case 'FUNDING':
    case 'FUNDED':
      return 'success'
    case 'IN_PROGRESS':
      return 'gold'
    case 'DRAFT':
    case 'APPROVED':
    case 'PENDING_APPROVAL':
      return 'warning'
    case 'CANCELLED':
    case 'SUSPENDED':
      return 'danger'
    default:
      return 'default'
  }
}

export const INVESTMENT_STATUS_AR: Record<string, string> = {
  RESERVED: 'محجوز',
  PENDING_PAYMENT: 'بانتظار الدفع',
  CONFIRMED: 'مؤكد',
  ACTIVE: 'نشط',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REFUNDED: 'مسترد',
}

export function investmentStatusTone(status?: string | null): BadgeTone {
  switch (status) {
    case 'ACTIVE':
    case 'CONFIRMED':
      return 'success'
    case 'RESERVED':
    case 'PENDING_PAYMENT':
      return 'warning'
    case 'CANCELLED':
    case 'REFUNDED':
      return 'danger'
    default:
      return 'default'
  }
}

export const ANIMAL_TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة',
  BEEF_CATTLE: 'أبقار لحم',
  BUFFALO: 'جاموس',
  GOAT: 'ماعز',
  SHEEP: 'أغنام', HORSE: 'خيل', CALVES: 'عجول',
  POULTRY: 'دواجن',
  FISH: 'أسماك',
  OTHER: 'أخرى',
}

export const PROJECT_PURPOSE_AR: Record<string, string> = {
  FATTENING: 'تسمين',
  DAIRY: 'ألبان',
  BREEDING: 'تربية',
  RESALE: 'تجارة',
}

export const AUDIT_ACTION_AR: Record<string, string> = {
  CREATE: 'إنشاء',
  UPDATE: 'تحديث',
  DELETE: 'حذف',
  LOGIN: 'تسجيل دخول',
  LOGOUT: 'تسجيل خروج',
  LOGIN_FAILED: 'محاولة دخول فاشلة',
  EXPORT: 'تصدير',
  APPROVE: 'موافقة',
  REJECT: 'رفض',
}

export function auditActionTone(action?: string | null): BadgeTone {
  switch (action) {
    case 'DELETE':
    case 'REJECT':
    case 'LOGIN_FAILED':
      return 'danger'
    case 'APPROVE':
    case 'CREATE':
      return 'success'
    case 'UPDATE':
    case 'EXPORT':
      return 'gold'
    default:
      return 'default'
  }
}

/* ------------------------------------------------------------------ */
/*  Table                                                               */
/* ------------------------------------------------------------------ */
export function DataTable({
  head,
  children,
  minWidth = 640,
}: {
  head: React.ReactNode[]
  children: React.ReactNode
  minWidth?: number
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-5 py-3 text-right font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('border-b border-border/40 transition-colors last:border-0 hover:bg-ivory/40', className)}>{children}</tr>
}

export function TableCell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-4 align-middle', className)}>{children}</td>
}

/* ------------------------------------------------------------------ */
/*  Filters                                                             */
/* ------------------------------------------------------------------ */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      {children}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'ابحث...',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pr-10"
      />
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="input-field w-full sm:w-44"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                          */
/* ------------------------------------------------------------------ */
export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total?: number
  onPage: (page: number) => void
}) {
  const pages = Math.max(1, Number(totalPages) || 1)
  if (pages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const end = Math.min(pages, start + 4)
  const nums: number[] = []
  for (let i = start; i <= end; i++) nums.push(i)

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-border/60 px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
      <div className="text-xs text-muted-foreground">
        {total !== undefined
          ? `إجمالي ${formatNumber(total)} عنصر — صفحة ${formatNumber(page)} من ${formatNumber(pages)}`
          : `صفحة ${formatNumber(page)} من ${formatNumber(pages)}`}
      </div>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={btn}>
          السابق
        </button>
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className={cn(btn, n === page ? 'border-primary bg-primary text-ivory' : 'text-primary hover:bg-primary/5')}
          >
            {formatNumber(n)}
          </button>
        ))}
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className={btn}>
          التالي
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Async states                                                        */
/* ------------------------------------------------------------------ */
export function LoadingState({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-gold" />
      {label}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  title = 'حدث خطأ أثناء التحميل',
}: {
  message?: string
  onRetry?: () => void
  title?: string
}) {
  const denied = !!message && message.includes('الصلاحية')
  if (denied) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="font-semibold text-primary">هذه الصفحة غير متاحة لحسابك</p>
        <p className="text-sm text-muted-foreground">ليس لديك صلاحية الوصول إلى هذا القسم.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-primary">{title}</p>
        {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-outline text-xs">
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  icon: Icon = Inbox,
}: {
  title: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-semibold text-primary">{title}</p>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
