'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, RefreshCw, CalendarDays, Landmark, Receipt,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, num, formatDate, StatusBadge,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

const CATEGORY_AR: Record<string, string> = {
  FEED: 'علف',
  VETERINARY: 'بيطري',
  LABOR: 'عمالة',
  MAINTENANCE: 'صيانة',
  UTILITIES: 'مرافق',
  TRANSPORT: 'نقل',
  ADMIN: 'إدارية',
  OTHER: 'أخرى',
}

export function FinanceOverviewClient() {
  const [stats, setStats] = useState<any>(null)
  const [pl, setPl] = useState<any>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dash, profitLoss] = await Promise.all([
        http.get<any>('/admin/dashboard', {}, getToken),
        http.get<any>('/financial/reports/profit-loss', { params: { from, to } }, getToken),
      ])
      setStats(dash?.stats ?? null)
      setPl(profitLoss ?? null)
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل البيانات المالية')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  const revenue = num(pl?.totalRevenue ?? stats?.totalRevenue)
  const expenses = num(pl?.totalExpenses ?? stats?.totalExpenses)
  const net = num(pl?.netProfit ?? stats?.netProfit)
  const categories: Array<{ category?: string; amount?: number }> = Array.isArray(pl?.byCategory)
    ? pl.byCategory
    : []

  const cards = [
    {
      label: 'الإيرادات',
      value: formatEGP(revenue),
      icon: TrendingUp,
      hint: 'إجمالي الإيرادات في الفترة',
      tone: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'المصروفات',
      value: formatEGP(expenses),
      icon: TrendingDown,
      hint: 'إجمالي المصروفات في الفترة',
      tone: 'text-red-600',
      bg: 'bg-red-500/10',
    },
    {
      label: 'صافي الربح',
      value: formatEGP(net),
      icon: Wallet,
      hint: net >= 0 ? 'ربح صافي' : 'خسارة صافية',
      tone: net >= 0 ? 'text-gold-600' : 'text-red-600',
      bg: net >= 0 ? 'bg-gold/10' : 'bg-red-500/10',
    },
  ]

  const platform = [
    { label: 'إجمالي المشاريع', value: formatNumber(num(stats?.totalProjects)) },
    { label: 'المشاريع النشطة', value: formatNumber(num(stats?.activeProjects)) },
    { label: 'المزارع', value: formatNumber(num(stats?.totalFarms)) },
    { label: 'الحيوانات', value: formatNumber(num(stats?.totalAnimals)) },
    { label: 'المستخدمون', value: formatNumber(num(stats?.totalUsers)) },
    { label: 'المستثمرون', value: formatNumber(num(stats?.totalInvestors)) },
  ]

  const hasData = stats !== null || pl !== null

  return (
    <div className="space-y-6">
      <PageHeader
        title="النظرة العامة المالية"
        subtitle="ملخص الإيرادات والمصروفات وصافي الربح على مستوى المنصة"
        icon={Landmark}
        actions={
          <>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="input-field w-auto py-2 text-xs"
                aria-label="من تاريخ"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input-field w-auto py-2 text-xs"
                aria-label="إلى تاريخ"
              />
            </div>
            <button
              onClick={load}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {loading ? (
        <LoadingState label="جارٍ تحميل البيانات المالية..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !hasData ? (
        <EmptyState icon={Receipt} title="لا توجد بيانات مالية بعد" hint="سيظهر الملخص فور توفر القيود والمصروفات" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div key={c.label} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                    <div className="mt-2 text-2xl font-bold text-primary">{c.value}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{c.hint}</div>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.tone}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platform.map((p) => (
              <div key={p.label} className="rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
                <div className="text-xs text-muted-foreground">{p.label}</div>
                <div className="mt-1 text-xl font-bold text-primary">{p.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-0">
              <div className="border-b border-border/60 px-6 py-4">
                <h3 className="font-bold text-primary">المصروفات حسب البند</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {from || to ? `${formatDate(from || undefined)} — ${formatDate(to || undefined)}` : 'كل الفترات'}
                </p>
              </div>
              {categories.length === 0 ? (
                <EmptyState icon={Receipt} title="لا توجد مصروفات مصنفة" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                        <th className="px-6 py-3 text-right font-semibold">البند</th>
                        <th className="px-6 py-3 text-right font-semibold">المبلغ</th>
                        <th className="px-6 py-3 text-right font-semibold">النسبة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c, i) => {
                        const amount = num(c?.amount)
                        const pct = expenses > 0 ? (amount / expenses) * 100 : 0
                        return (
                          <tr key={`${c?.category || 'cat'}-${i}`} className="border-b border-border/40 hover:bg-ivory/40">
                            <td className="px-6 py-3 font-semibold text-primary">
                              {CATEGORY_AR[String(c?.category)] || (c?.category || 'أخرى')}
                            </td>
                            <td className="px-6 py-3">{formatEGP(amount)}</td>
                            <td className="px-6 py-3 text-xs text-muted-foreground">{formatNumber(Math.round(pct))}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="font-bold text-primary">مؤشرات الفترة</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-ivory p-4">
                  <span className="text-xs text-muted-foreground">إجمالي الإيرادات</span>
                  <span className="text-sm font-bold text-emerald-600">{formatEGP(revenue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-ivory p-4">
                  <span className="text-xs text-muted-foreground">إجمالي المصروفات</span>
                  <span className="text-sm font-bold text-red-600">{formatEGP(expenses)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <span className="text-xs text-muted-foreground">صافي الربح</span>
                  <span className={`text-sm font-bold ${net >= 0 ? 'text-gold-700' : 'text-red-600'}`}>
                    {formatEGP(net)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted-foreground">
                  <span>هامش الربح</span>
                  <StatusBadge
                    label={revenue > 0 ? `${formatNumber(Math.round((net / revenue) * 100))}%` : '—'}
                    tone={net >= 0 ? 'success' : 'danger'}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
