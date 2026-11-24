'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Scale, RefreshCw, CalendarDays, TrendingUp, TrendingDown, Wallet, ChartPie,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, num, formatDate,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

interface TrialBalanceRow {
  code: string
  name: string
  type: string
  debit: number
  credit: number
  balance: number
  normalBalance?: string
}

interface ProfitLoss {
  totalRevenue?: number
  totalExpenses?: number
  netProfit?: number
  byCategory?: Array<{ category?: string; amount?: number }>
}

const TYPE_AR: Record<string, string> = {
  ASSET: 'أصول',
  LIABILITY: 'التزامات',
  EQUITY: 'حقوق الملكية',
  REVENUE: 'إيرادات',
  EXPENSE: 'مصروفات',
}

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

export function ReportsClient() {
  const [tb, setTb] = useState<TrialBalanceRow[]>([])
  const [pl, setPl] = useState<ProfitLoss | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [trialBalance, profitLoss] = await Promise.all([
        http.get<TrialBalanceRow[]>('/financial/reports/trial-balance', {}, getToken),
        http.get<ProfitLoss>('/financial/reports/profit-loss', { params: { from, to } }, getToken),
      ])
      setTb(Array.isArray(trialBalance) ? trialBalance : [])
      setPl(profitLoss ?? null)
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل التقارير')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  const revenue = num(pl?.totalRevenue)
  const expenses = num(pl?.totalExpenses)
  const net = num(pl?.netProfit)
  const categories = Array.isArray(pl?.byCategory) ? pl!.byCategory! : []

  const tbTotals = tb.reduce(
    (acc, r) => ({
      debit: acc.debit + num(r?.debit),
      credit: acc.credit + num(r?.credit),
      balance: acc.balance + num(r?.balance),
    }),
    { debit: 0, credit: 0, balance: 0 },
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="التقارير المالية"
        subtitle="ميزان المراجعة وحساب الأرباح والخسائر"
        icon={Scale}
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {loading ? (
        <LoadingState label="جارٍ تحميل التقارير..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">الإيرادات</div>
                  <div className="text-xl font-bold text-primary">{formatEGP(revenue)}</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">المصروفات</div>
                  <div className="text-xl font-bold text-primary">{formatEGP(expenses)}</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${net >= 0 ? 'bg-gold/10 text-gold-600' : 'bg-red-500/10 text-red-600'}`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">صافي الربح</div>
                  <div className={`text-xl font-bold ${net >= 0 ? 'text-gold-700' : 'text-red-600'}`}>{formatEGP(net)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="card min-w-0 p-0 lg:col-span-3">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <h3 className="font-bold text-primary">ميزان المراجعة</h3>
                <span className="text-xs text-muted-foreground">
                  {from || to ? `${formatDate(from || undefined)} — ${formatDate(to || undefined)}` : 'كل الفترات'}
                </span>
              </div>
              {tb.length === 0 ? (
                <EmptyState icon={Scale} title="لا توجد حسابات في ميزان المراجعة" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                        <th className="px-6 py-3 text-right font-semibold">الكود</th>
                        <th className="px-6 py-3 text-right font-semibold">الحساب</th>
                        <th className="px-6 py-3 text-right font-semibold">النوع</th>
                        <th className="px-6 py-3 text-right font-semibold">المدين</th>
                        <th className="px-6 py-3 text-right font-semibold">الدائن</th>
                        <th className="px-6 py-3 text-right font-semibold">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tb.map((r, i) => (
                        <tr key={`${r?.code || 'acc'}-${i}`} className="border-b border-border/40 hover:bg-ivory/40">
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{r?.code}</td>
                          <td className="px-6 py-3 font-semibold text-primary">{r?.name}</td>
                          <td className="px-6 py-3 text-xs text-muted-foreground">{TYPE_AR[String(r?.type)] || String(r?.type || '—')}</td>
                          <td className="px-6 py-3 text-emerald-700">{num(r?.debit) ? formatEGP(num(r.debit)) : '—'}</td>
                          <td className="px-6 py-3 text-red-700">{num(r?.credit) ? formatEGP(num(r.credit)) : '—'}</td>
                          <td className="px-6 py-3 font-semibold">{formatEGP(num(r?.balance))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-ivory/50 text-sm font-bold text-primary">
                        <td className="px-6 py-3" colSpan={3}>الإجمالي</td>
                        <td className="px-6 py-3 text-emerald-700">{formatEGP(tbTotals.debit)}</td>
                        <td className="px-6 py-3 text-red-700">{formatEGP(tbTotals.credit)}</td>
                        <td className="px-6 py-3">{formatEGP(tbTotals.balance)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="card min-w-0 p-0 lg:col-span-2">
              <div className="border-b border-border/60 px-6 py-4">
                <h3 className="font-bold text-primary">الأرباح والخسائر</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">توزيع المصروفات حسب البند</p>
              </div>
              {categories.length === 0 ? (
                <EmptyState icon={ChartPie} title="لا توجد بيانات مصروفات" hint="لم يتم رصد مصروفات في هذه الفترة" />
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
                              {CATEGORY_AR[String(c?.category)] || String(c?.category || 'أخرى')}
                            </td>
                            <td className="px-6 py-3">{formatEGP(amount)}</td>
                            <td className="px-6 py-3 text-xs text-muted-foreground">{formatNumber(Math.round(pct))}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-ivory/50 text-sm font-bold text-primary">
                        <td className="px-6 py-3">صافي الربح</td>
                        <td className="px-6 py-3" colSpan={2}>
                          <span className={net >= 0 ? 'text-gold-700' : 'text-red-600'}>{formatEGP(net)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
