'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Users, UserCheck, FolderKanban, Building2, PawPrint, TrendingUp, TrendingDown,
  Wallet, Briefcase, Clock, ShieldCheck, ScrollText, Receipt, ClipboardList,
  ArrowDownCircle, RefreshCw, Inbox,
} from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP, formatNumber } from '@/lib/utils'
import {
  AdminCard, AdminCardHeader, ErrorState, LoadingState, PageHeader, StatCard, StatusBadge,
  auditActionTone, formatDate, formatDateTime, fullName, getToken, toNum,
  AUDIT_ACTION_AR,
} from './_components/admin-ui'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface DashboardStats {
  totalUsers?: number
  totalInvestors?: number
  totalInvestments?: number
  totalInvestedAmount?: number
  totalProjects?: number
  activeProjects?: number
  totalFarms?: number
  totalAnimals?: number
  totalRevenue?: number
  totalExpenses?: number
  netProfit?: number
  pendingPayments?: number
  pendingWithdrawals?: number
  openTickets?: number
}

interface Kpis {
  newUsersMonth?: number
  userGrowth?: number
  newInvestmentsMonth?: number
  investmentValueMonth?: number
  revenueMonth?: number
  expensesMonth?: number
  activeFarms?: number
  totalPens?: number
  averagePenOccupancy?: number
}

interface PendingApprovals {
  expenses?: number
  purchaseOrders?: number
  sales?: number
  withdrawals?: number
}

interface AuditEntry {
  id?: string
  action?: string
  entity?: string
  entityId?: string | null
  createdAt?: string
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export function AdminOverviewClient() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [kpis, setKpis] = useState<Kpis>({})
  const [pending, setPending] = useState<PendingApprovals>({})
  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [failedSections, setFailedSections] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setFailedSections([])
    const token = () => getToken()

    const results = await Promise.allSettled([
      http.get<any>('/admin/dashboard', {}, token),
      http.get<any>('/admin/kpis', {}, token),
      http.get<any>('/admin/pending-approvals', {}, token),
    ])

    const failed: string[] = []

    if (results[0].status === 'fulfilled') {
      const res = results[0].value
      setStats(res?.stats ?? {})
      setRecentAudit(Array.isArray(res?.recentAudit) ? res.recentAudit : [])
    } else {
      failed.push('لوحة الإدارة')
    }

    if (results[1].status === 'fulfilled') {
      setKpis(results[1].value ?? {})
    } else {
      failed.push('مؤشرات الأداء')
    }

    if (results[2].status === 'fulfilled') {
      setPending(results[2].value ?? {})
    } else {
      failed.push('الموافقات المعلقة')
    }

    setFailedSections(failed)
    if (results.every((r) => r.status === 'rejected')) {
      setError('تعذر تحميل بيانات الإدارة. تأكد من صلاحيات المدير أو أعد المحاولة.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const netProfit = toNum(stats.netProfit)

  const statCards = [
    {
      label: 'إجمالي المستخدمين',
      value: formatNumber(toNum(stats.totalUsers)),
      icon: Users,
      hint: `${formatNumber(toNum(stats.totalInvestors))} مستثمر`,
      tone: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'المستثمرون',
      value: formatNumber(toNum(stats.totalInvestors)),
      icon: UserCheck,
      hint: 'من إجمالي المستخدمين',
      tone: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'المشاريع',
      value: formatNumber(toNum(stats.totalProjects)),
      icon: FolderKanban,
      hint: `${formatNumber(toNum(stats.activeProjects))} مشروع نشط`,
      tone: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'المزارع',
      value: formatNumber(toNum(stats.totalFarms)),
      icon: Building2,
      hint: `${formatNumber(toNum(kpis.activeFarms))} مزرعة نشطة هذا الشهر`,
      tone: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'الحيوانات',
      value: formatNumber(toNum(stats.totalAnimals)),
      icon: PawPrint,
      hint: `${formatNumber(toNum(kpis.totalPens))} عنبر`,
      tone: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'الإيرادات',
      value: formatEGP(toNum(stats.totalRevenue)),
      icon: TrendingUp,
      hint: `هذا الشهر: ${formatEGP(toNum(kpis.revenueMonth))}`,
      tone: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'المصروفات',
      value: formatEGP(toNum(stats.totalExpenses)),
      icon: TrendingDown,
      hint: `هذا الشهر: ${formatEGP(toNum(kpis.expensesMonth))}`,
      tone: 'text-red-600',
      bg: 'bg-red-500/10',
    },
    {
      label: 'صافي الربح',
      value: formatEGP(netProfit),
      icon: Wallet,
      hint: netProfit >= 0 ? 'إيرادات أكبر من المصروفات' : 'المصروفات أكبر من الإيرادات',
      tone: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      label: 'الاستثمارات',
      value: formatNumber(toNum(stats.totalInvestments)),
      icon: Briefcase,
      hint: formatEGP(toNum(stats.totalInvestedAmount)),
      tone: 'text-gold-700',
      bg: 'bg-gold/10',
    },
    {
      label: 'المدفوعات المعلقة',
      value: formatNumber(toNum(stats.pendingPayments)),
      icon: Clock,
      hint: `${formatNumber(toNum(stats.pendingWithdrawals))} طلب سحب معلق`,
      tone: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
  ]

  const kpiCards = [
    {
      label: 'مستخدمون جدد هذا الشهر',
      value: formatNumber(toNum(kpis.newUsersMonth)),
      icon: Users,
      hint: `${toNum(kpis.userGrowth) >= 0 ? '+' : ''}${formatNumber(toNum(kpis.userGrowth))}٪ عن الشهر الماضي`,
    },
    {
      label: 'استثمارات جديدة',
      value: formatNumber(toNum(kpis.newInvestmentsMonth)),
      icon: Briefcase,
      hint: formatEGP(toNum(kpis.investmentValueMonth)),
    },
    {
      label: 'إيرادات الشهر',
      value: formatEGP(toNum(kpis.revenueMonth)),
      icon: TrendingUp,
      hint: 'مبيعات مكتملة ومسلّمة',
    },
    {
      label: 'مصروفات الشهر',
      value: formatEGP(toNum(kpis.expensesMonth)),
      icon: TrendingDown,
      hint: 'المصروفات المدفوعة',
    },
    {
      label: 'مزارع نشطة',
      value: formatNumber(toNum(kpis.activeFarms)),
      icon: Building2,
      hint: `${formatNumber(toNum(kpis.totalPens))} عنبر إجمالًا`,
    },
    {
      label: 'متوسط إشغال العنابر',
      value: formatNumber(toNum(kpis.averagePenOccupancy)),
      icon: PawPrint,
      hint: 'متوسط عدد الحيوانات في العنبر',
    },
  ]

  const pendingCards = [
    { label: 'مصروفات بانتظار الاعتماد', value: toNum(pending.expenses), icon: Receipt },
    { label: 'أوامر شراء مسودة', value: toNum(pending.purchaseOrders), icon: ClipboardList },
    { label: 'مبيعات معلقة', value: toNum(pending.sales), icon: TrendingUp },
    { label: 'طلبات سحب معلقة', value: toNum(pending.withdrawals), icon: ArrowDownCircle },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة الإدارة"
        subtitle="نظرة شاملة على أداء المنصة والمؤشرات المالية والتشغيلية"
        icon={ShieldCheck}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary transition-colors hover:bg-primary/5"
            aria-label="تحديث"
          >
            <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
          </button>
        }
      />

      {error ? (
        <AdminCard>
          <ErrorState message={error} onRetry={() => void load()} />
        </AdminCard>
      ) : loading ? (
        <AdminCard>
          <LoadingState label="جارٍ تحميل بيانات الإدارة..." />
        </AdminCard>
      ) : (
        <>
          {failedSections.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              تعذر تحميل بعض الأقسام: {failedSections.join('، ')}
            </div>
          ) : null}

          {/* Main stats */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">المؤشرات العامة</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {statCards.map((c) => (
                <StatCard
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  icon={c.icon}
                  hint={c.hint}
                  tone={c.tone}
                  bg={c.bg}
                />
              ))}
            </div>
          </section>

          {/* KPIs */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-primary">مؤشرات الشهر الحالي</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpiCards.map((c) => (
                <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} hint={c.hint} />
              ))}
            </div>
          </section>

          {/* Pending approvals */}
          <section>
            <AdminCard>
              <AdminCardHeader
                title="الموافقات المعلقة"
                subtitle="بنود تتطلب مراجعة واعتماد الإدارة"
                actions={
                  <StatusBadge tone="warning">
                    <Clock className="h-3.5 w-3.5" />
                    {formatNumber(pendingCards.reduce((s, c) => s + c.value, 0))} بند
                  </StatusBadge>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pendingCards.map((c) => (
                  <div key={c.label} className="rounded-xl border border-border/60 bg-ivory/50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
                        <c.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-primary">{formatNumber(c.value)}</div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </section>

          {/* Recent audit */}
          <section>
            <AdminCard className="p-0">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-gold" />
                  <h3 className="font-bold text-primary">أحدث سجلات التدقيق</h3>
                </div>
              </div>
              {recentAudit.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <Inbox className="h-10 w-10 text-primary/20" />
                  <p className="text-sm text-muted-foreground">لا توجد سجلات تدقيق بعد</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recentAudit.slice(0, 8).map((log, i) => (
                    <div key={log.id ?? i} className="flex flex-wrap items-center gap-3 px-6 py-3">
                      <StatusBadge tone={auditActionTone(log.action)}>
                        {AUDIT_ACTION_AR[log.action ?? ''] ?? log.action ?? '—'}
                      </StatusBadge>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-primary">{log.entity ?? '—'}</span>
                        {log.entityId ? (
                          <span className="mr-2 text-[11px] text-muted-foreground" dir="ltr">
                            {log.entityId}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">{fullName(log.user)}</div>
                      <div className="text-[11px] text-muted-foreground">{formatDate(log.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </section>
        </>
      )}
    </div>
  )
}
