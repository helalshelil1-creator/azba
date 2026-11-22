'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, Filter, TrendingUp, Users, CalendarDays, ShieldCheck,
  ArrowLeft, Loader2, MapPin, Sparkles, AlertTriangle,
} from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { http } from '@/lib/api'
import { cn, formatEGP, formatPercent } from '@/lib/utils'
import { animalImage, animalLabel } from '@/lib/animals'

interface Project {
  id: string
  code: string
  name: string
  nameEn?: string
  animalType: string
  breed: string
  description?: string
  expectedReturn: any
  expectedReturnRate?: any
  riskLevel: string
  status: string
  targetAmount: any
  raisedAmount: any
  fundedAmount?: any
  sharePrice: any
  totalShares: number
  soldShares: number
  startDate?: string
  expectedEndDate?: string
  farm?: { name: string; city: string; governorate: string }
}

const TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة',
  BEEF_CATTLE: 'أبقار لحم',
  BUFFALO: 'جاموس',
  GOAT: 'ماعز',
  SHEEP: 'أغنام',
  POULTRY: 'دواجن',
  FISH: 'أسماك',
  OTHER: 'أخرى',
}

const RISK_AR: Record<string, { ar: string; cls: string }> = {
  LOW: { ar: 'منخفض', cls: 'badge-success' },
  MEDIUM: { ar: 'متوسط', cls: 'badge-warning' },
  HIGH: { ar: 'مرتفع', cls: 'badge-danger' },
  CRITICAL: { ar: 'حرج', cls: 'badge-danger' },
}

const STATUS_AR: Record<string, string> = {
  FUNDING: 'قيد التمويل',
  ACTIVE: 'نشط',
  IN_PROGRESS: 'قيد التنفيذ',
  APPROVED: 'معتمد',
}

export function OpportunitiesClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [risk, setRisk] = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<{ items: Project[]; total: number }>('/opportunities', {
        params: { page: 1, limit: 50, status: 'FUNDING,ACTIVE,IN_PROGRESS,APPROVED' },
      })
      setProjects(res.items ?? [])
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل الفرص')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.trim()
      const matchQ = !q || p.name.includes(q) || p.nameEn?.toLowerCase().includes(q.toLowerCase()) || p.code.includes(q) || p.breed.includes(q)
      const matchT = type === 'all' || p.animalType === type
      const matchR = risk === 'all' || p.riskLevel === risk
      return matchQ && matchT && matchR
    })
  }, [projects, search, type, risk])

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-page relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              {projects.length} فرصة استثمارية
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              فرص الاستثمار المتاحة
            </h1>
            <p className="mt-3 max-w-2xl text-ivory/70">
              اختر المشروع المناسب لأهدافك الاستثمارية وابدأ بحد أدنى مرن. كل مشروع موثّق بالبيانات والتقارير البيطرية.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="container-page py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو السلالة أو الكود..."
              className="input-dark w-full pr-10 border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-gold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-dark border-border bg-white px-4 text-foreground">
              <option value="all">كل الأنواع</option>
              {Object.entries(TYPE_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={risk} onChange={(e) => setRisk(e.target.value)} className="input-dark border-border bg-white px-4 text-foreground">
              <option value="all">كل المخاطر</option>
              <option value="LOW">منخفض</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HIGH">مرتفع</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
            جارٍ تحميل الفرص...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
            <p className="mt-3 text-red-700">{error}</p>
            <button onClick={load} className="btn-outline mt-4 text-sm">إعادة المحاولة</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-white p-16 text-center">
            <Filter className="mx-auto h-12 w-12 text-primary/20" />
            <p className="mt-4 text-muted-foreground">لا توجد فرص مطابقة لبحثك</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => {
              const raised = Number(p.fundedAmount ?? p.raisedAmount)
              const target = Number(p.targetAmount)
              const pct = target > 0 ? Math.round((raised / target) * 100) : 0
              const riskInfo = RISK_AR[p.riskLevel] ?? { ar: p.riskLevel, cls: 'badge-default' }
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link href={`/projects/${p.id}`} className="group block h-full">
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                      {/* Cover */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={animalImage(p.animalType)}
                          alt={p.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-primary-950/25 to-transparent" />
                        <div className="absolute right-4 top-4 flex gap-2">
                          <span className="badge bg-white/90 text-primary backdrop-blur">{animalLabel(p.animalType)}</span>
                          <span className={cn('badge', riskInfo.cls)}>{riskInfo.ar}</span>
                        </div>
                        <div className="absolute bottom-4 right-4 left-4">
                          <div className="text-xs text-ivory/70">{p.code}</div>
                          <h3 className="mt-0.5 text-lg font-bold text-white">{p.name}</h3>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                          <div className="rounded-xl bg-ivory p-3">
                            <div className="text-[11px] text-muted-foreground">العائد المتوقع</div>
                            <div className="mt-1 text-lg font-bold text-emerald-600">{formatPercent(Number(p.expectedReturnRate ?? p.expectedReturn ?? 0))}</div>
                          </div>
                          <div className="rounded-xl bg-ivory p-3">
                            <div className="text-[11px] text-muted-foreground">سعر السهم</div>
                            <div className="mt-1 text-lg font-bold text-primary">{formatEGP(Number(p.sharePrice))}</div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-primary">{formatEGP(raised)}</span>
                            <span className="text-muted-foreground">من {formatEGP(target)}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory">
                            <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold-600 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{pct}% مموّل</span>
                            <span>{p.soldShares}/{p.totalShares} سهم</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {p.farm?.governorate ?? 'مصر'}
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 transition-transform group-hover:-translate-x-1">
                            التفاصيل
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Risk note */}
      <div className="container-page pb-12">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">إفصاح المخاطر</div>
            <p className="mt-1 leading-relaxed">
              الاستثمار في الثروة الحيوانية ينطوي على مخاطر تشغيلية وسوقية وصحية. الأداء السابق لا يضمن النتائج المستقبلية.
              العوائد المعروضة تقديرية وقد تختلف حسب ظروف التشغيل والأسعار.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
