'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Loader2, MapPin, ShieldAlert, TrendingUp, Clock, Wallet, ArrowLeft,
  BadgeCheck, SlidersHorizontal, Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { http } from '@/lib/api'
import { SHOWCASE_PROJECTS } from '@/lib/showcase'
import { animalImage, animalLabel } from '@/lib/animals'
import { cn, formatEGP } from '@/lib/utils'

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface Opportunity {
  id: string
  code: string
  name: string
  animalType: string
  breed: string
  purpose: string
  status: string
  location: string
  sharePrice: number
  targetAmount: number
  fundedAmount: number
  expectedReturnRate: number
  riskLevel: RiskLevel
  durationMonths: number
  totalShares: number
  soldShares: number
  cover: string
}

const PURPOSE_AR: Record<string, string> = {
  FATTENING: 'تسمين',
  DAIRY: 'ألبان',
  BREEDING: 'تربية',
  RESALE: 'إعادة بيع',
}

const RISK_LABEL: Record<string, string> = {
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'مرتفع',
  CRITICAL: 'حرج',
}

const RISK_CLS: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
}

const TYPE_OPTIONS = [
  { value: 'DAIRY_COW', label: 'أبقار حلابة' },
  { value: 'BEEF_CATTLE', label: 'أبقار لحم' },
  { value: 'BUFFALO', label: 'جاموس' },
  { value: 'GOAT', label: 'ماعز' },
  { value: 'SHEEP', label: 'أغنام وخرفان' },
  { value: 'HORSE', label: 'خيل' },
  { value: 'CALVES', label: 'عجول' },
]

function monthsBetween(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0
  const d1 = new Date(a).getTime()
  const d2 = new Date(b).getTime()
  if (!d1 || !d2 || d2 <= d1) return 0
  return Math.max(1, Math.round((d2 - d1) / (30 * 24 * 60 * 60 * 1000)))
}

function toOpportunity(p: any): Opportunity {
  const target = Number(p.targetAmount ?? 0)
  const funded = Number(p.fundedAmount ?? p.raisedAmount ?? 0)
  return {
    id: String(p.id ?? p.code),
    code: p.code ?? '—',
    name: p.name ?? 'مشروع',
    animalType: p.animalType ?? 'OTHER',
    breed: p.breed ?? '—',
    purpose: p.purpose ?? 'FATTENING',
    status: p.status ?? 'FUNDING',
    location: p.farm?.governorate ?? 'مصر',
    sharePrice: Number(p.sharePrice ?? 0),
    targetAmount: target,
    fundedAmount: funded,
    expectedReturnRate: Number(p.expectedReturnRate ?? p.expectedReturn ?? 0),
    riskLevel: (p.riskLevel ?? 'MEDIUM') as RiskLevel,
    durationMonths: monthsBetween(p.startDate, p.expectedEndDate),
    totalShares: Number(p.totalShares ?? 0),
    soldShares: Number(p.soldShares ?? 0),
    cover: animalImage(p.animalType),
  }
}

export default function InvestPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [risk, setRisk] = useState('all')
  const [sort, setSort] = useState('return')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await http.get<any>('/projects?page=1&limit=50')
        const raw = Array.isArray(res?.data) ? res.data : []
        if (alive) setItems(raw.map(toOpportunity))
      } catch {
        // الـ API غير متاح: نفس بيانات العرض الموجودة في الـ seed
        if (alive) setItems(SHOWCASE_PROJECTS.map(toOpportunity))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const stats = useMemo(() => {
    const count = items.length
    const totalTarget = items.reduce((s, i) => s + i.targetAmount, 0)
    const avgReturn = count
      ? Math.round(items.reduce((s, i) => s + i.expectedReturnRate, 0) / count)
      : 0
    const minShare = count ? Math.min(...items.map((i) => i.sharePrice)) : 0
    return { count, totalTarget, avgReturn, minShare }
  }, [items])

  const rows = useMemo(() => {
    let out = items.filter(
      (i) =>
        (type === 'all' || i.animalType === type) &&
        (risk === 'all' || i.riskLevel === risk),
    )
    out = [...out].sort((a, b) => {
      if (sort === 'target') return a.targetAmount - b.targetAmount
      if (sort === 'funded')
        return b.fundedAmount / Math.max(1, b.targetAmount) - a.fundedAmount / Math.max(1, a.targetAmount)
      return b.expectedReturnRate - a.expectedReturnRate
    })
    return out
  }, [items, type, risk, sort])

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ترويسة الصفحة */}
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <span className="badge border border-gold/40 bg-gold/15 text-gold">فرص الاستثمار</span>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug sm:text-4xl lg:text-5xl">
            قارن الفرص <span className="text-gradient-gold">واختر الأنسب</span> لمحفظتك
          </h1>
          <p className="mt-4 max-w-2xl text-ivory/70">
            المشاريع المعروضة هنا للاطلاع فقط، وأرقامها نماذج توضيحية وليست عرضًا استثماريًا فعليًا.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'فرصة متاحة', value: String(stats.count), icon: Sparkles },
              { label: 'إجمالي المستهدف', value: formatEGP(stats.totalTarget), icon: Wallet },
              { label: 'متوسط العائد التقديري', value: `${stats.avgReturn}%`, icon: TrendingUp },
              { label: 'الحد الأدنى للسهم', value: formatEGP(stats.minShare), icon: BadgeCheck },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-ivory/60">
                  <s.icon className="h-4 w-4 text-gold" />
                  <span className="text-xs">{s.label}</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        {/* الفلاتر */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <SlidersHorizontal className="h-4 w-4 text-gold" />
            تصفية
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-field lg:w-52">
            <option value="all">كل الأصناف</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} className="input-field lg:w-44">
            <option value="all">كل مستويات المخاطر</option>
            <option value="LOW">منخفض</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HIGH">مرتفع</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field lg:w-56">
            <option value="return">الأعلى عائدًا</option>
            <option value="funded">الأقرب للاكتتاب</option>
            <option value="target">الأصغر تمويلًا</option>
          </select>
          <Link href="/opportunities" className="btn-outline text-sm lg:mr-auto">
            كل الفرص بالتفصيل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <span className="text-sm">جارٍ تحميل الفرص...</span>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center text-sm text-muted-foreground">
            لا توجد فرص مطابقة للتصفية الحالية.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((p, i) => {
            const pct =
              p.targetAmount > 0
                ? Math.min(100, Math.round((p.fundedAmount / p.targetAmount) * 100))
                : 0
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
              >
                <div className="relative h-44 overflow-hidden bg-primary-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 to-transparent" />
                  <span
                    className={cn(
                      'absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md',
                      RISK_CLS[p.riskLevel] ?? RISK_CLS.MEDIUM,
                    )}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    مخاطر {RISK_LABEL[p.riskLevel] ?? p.riskLevel}
                  </span>
                  <span className="absolute bottom-4 right-4 left-4 truncate text-sm font-bold text-white">
                    {animalLabel(p.animalType)} • {PURPOSE_AR[p.purpose] ?? p.purpose}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-primary transition-colors group-hover:text-gold-600">
                    {p.name}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.location} • {p.breed}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-ivory p-2">
                      <div className="text-[10px] text-muted-foreground">المستهدف</div>
                      <div className="text-xs font-bold text-primary">{formatEGP(p.targetAmount)}</div>
                    </div>
                    <div className="rounded-xl bg-ivory p-2">
                      <div className="text-[10px] text-muted-foreground">سعر السهم</div>
                      <div className="text-xs font-bold text-primary">{formatEGP(p.sharePrice)}</div>
                    </div>
                    <div className="rounded-xl bg-ivory p-2">
                      <div className="text-[10px] text-muted-foreground">العائد</div>
                      <div className="text-xs font-bold text-gold-600">{p.expectedReturnRate}%</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>تم تمويل {pct}%</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {p.durationMonths || '—'} شهر
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ivory">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-gold to-gold-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/projects/${p.id}`}
                    className="btn-gold mt-5 justify-center py-3 text-sm"
                  >
                    تفاصيل الفرصة
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* دعوة للاستثمار */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-primary-950 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            تصفّح <span className="text-gradient-gold">المشاريع المعروضة</span> بنفسك
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ivory/70">
            عرض شخصي غير تجاري: لا يوجد حجز أو دفع فعلي. يمكنك إنشاء حساب لتجربة لوحة المتابعة.
          </p>
          <Link href="/register" className="btn-gold mt-6 px-8 py-3.5">
            إنشاء حساب للتجربة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
