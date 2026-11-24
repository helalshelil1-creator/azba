'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Wallet, TrendingUp, Banknote, TrendingDown, Layers, FolderKanban,
  ArrowLeft, RefreshCw, Bell, CalendarClock, ShieldCheck, Sparkles,
} from 'lucide-react'
import { http } from '@/lib/api'
import { useAuth } from '@/lib/auth-store'
import { cn, formatEGP, formatPercent } from '@/lib/utils'
import { Card } from '@azba/ui/card'
import { PageLogo } from '@/components/layout/page-logo'

interface Stats {
  totalInvested: number
  portfolioValue: number
  realizedProfit: number
  unrealizedProfit: number
  losses: number
  totalShares: number
  activeProjects: number
  completedProjects: number
  pendingDistributions: number
  walletBalance: number
  walletLocked: number
}

interface Investment {
  id: string
  contractNumber?: string
  shareCount: number
  netAmount: number
  status: string
  totalDistributions: number
  realizedProfit: number
  project: { id: string; name: string; status: string; animalType: string }
  createdAt: string
}

interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
  readAt: string | null
  type: string
}

const EMPTY_STATS: Stats = {
  totalInvested: 0, portfolioValue: 0, realizedProfit: 0, unrealizedProfit: 0,
  losses: 0, totalShares: 0, activeProjects: 0, completedProjects: 0,
  pendingDistributions: 0, walletBalance: 0, walletLocked: 0,
}

const STATUS_LABEL: Record<string, { ar: string; cls: string }> = {
  ACTIVE: { ar: 'نشط', cls: 'success' },
  CONFIRMED: { ar: 'مؤكد', cls: 'info' },
  RESERVED: { ar: 'محجوز', cls: 'warning' },
  PENDING_PAYMENT: { ar: 'بانتظار الدفع', cls: 'warning' },
  COMPLETED: { ar: 'مكتمل', cls: 'default' },
  CANCELLED: { ar: 'ملغي', cls: 'danger' },
  REFUNDED: { ar: 'مسترد', cls: 'default' },
}

export default function InvestorDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<any>('/investments/dashboard', {}, () => localStorage.getItem('azba_access_token'))
      setStats(res.stats ?? EMPTY_STATS)
      setInvestments(res.investments ?? [])
      setNotifications(res.notifications ?? [])
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const cards = [
    {
      label: 'إجمالي الاستثمار',
      value: formatEGP(stats.totalInvested),
      icon: Wallet,
      hint: `${stats.totalShares} سهم`,
      tone: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'قيمة المحفظة',
      value: formatEGP(stats.portfolioValue),
      icon: Banknote,
      hint: `${stats.activeProjects} مشروع نشط`,
      tone: 'text-gold-600',
      bg: 'bg-gold/10',
    },
    {
      label: 'الأرباح المحققة',
      value: formatEGP(stats.realizedProfit),
      icon: TrendingUp,
      hint: 'موزعة فعلًا',
      tone: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'الأرباح غير المحققة',
      value: formatEGP(stats.unrealizedProfit),
      icon: Sparkles,
      hint: stats.losses > 0 ? `خسائر: ${formatEGP(stats.losses)}` : 'قيد التنفيذ',
      tone: stats.losses > 0 ? 'text-red-600' : 'text-blue-600',
      bg: stats.losses > 0 ? 'bg-red-500/10' : 'bg-blue-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-primary-950 text-white shadow-sm">
        <Image src="/images/cattle.jpg" alt="" aria-hidden="true" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-l from-primary-950 via-primary-950/80 to-primary-950/20" />
        <PageLogo className="relative pt-6" />
        <div className="relative flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
              استثمر في مستقبل <span className="text-gradient-gold">أكثر ازدهارًا</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ivory/75">
              مرحبًا {user?.firstName} — إليك نظرة شاملة على محفظتك الاستثمارية ومشاريعك.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/dashboard/invest" className="btn-gold">
              <Sparkles className="h-4 w-4" />
              ابدأ الاستثمار
            </Link>
            <button
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                <div className="mt-2 text-2xl font-bold text-primary">{c.value}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{c.hint}</div>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', c.bg, c.tone)}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wallet + pending */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary">محفظتي النقدية</h3>
            <Link href="/dashboard/wallet" className="text-xs font-semibold text-gold-600 hover:underline">
              التفاصيل
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-ivory p-4">
              <div className="text-xs text-muted-foreground">الرصيد المتاح</div>
              <div className="mt-1 text-xl font-bold text-primary">{formatEGP(stats.walletBalance)}</div>
            </div>
            <div className="rounded-xl bg-ivory p-4">
              <div className="text-xs text-muted-foreground">الرصيد المحجوز</div>
              <div className="mt-1 text-xl font-bold text-gold-600">{formatEGP(stats.walletLocked)}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-gold-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            أرباح قيد التحقق: {formatEGP(stats.pendingDistributions)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary">آخر الإشعارات</h3>
            <Link href="/dashboard/notifications" className="text-xs font-semibold text-gold-600 hover:underline">
              الكل
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30" />
                لا إشعارات بعد
              </div>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl border border-border/60 p-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{n.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Investments table */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h3 className="font-bold text-primary">استثماراتي</h3>
          <Link href="/dashboard/portfolio" className="text-xs font-semibold text-gold-600 hover:underline">
            كل الاستثمارات
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <RefreshCw className="ml-2 h-5 w-5 animate-spin" />
            جارٍ التحميل...
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={load} className="btn-outline mt-4 text-xs">إعادة المحاولة</button>
          </div>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderKanban className="h-12 w-12 text-primary/20" />
            <p className="text-sm text-muted-foreground">لا توجد استثمارات بعد</p>
            <Link href="/opportunities" className="btn-gold text-sm">
              تصفح الفرص
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-right font-semibold">المشروع</th>
                  <th className="px-6 py-3 text-right font-semibold">الأسهم</th>
                  <th className="px-6 py-3 text-right font-semibold">المبلغ</th>
                  <th className="px-6 py-3 text-right font-semibold">العائد</th>
                  <th className="px-6 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const st = STATUS_LABEL[inv.status] || { ar: inv.status, cls: 'default' }
                  return (
                    <tr key={inv.id} className="border-b border-border/40 transition-colors hover:bg-ivory/40">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${inv.project.id}`} className="font-semibold text-primary hover:text-gold-600">
                          {inv.project.name}
                        </Link>
                        {inv.contractNumber && (
                          <div className="text-[10px] text-muted-foreground" dir="ltr">{inv.contractNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold">{inv.shareCount}</td>
                      <td className="px-6 py-4">{formatEGP(inv.netAmount)}</td>
                      <td className={cn('px-6 py-4 font-semibold', inv.realizedProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                        {formatEGP(inv.realizedProfit)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('badge', `badge-${st.cls}`)}>{st.ar}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
