'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Clock, ShieldAlert, ArrowLeft, ChevronLeft, Loader2 } from 'lucide-react'
import { cn, formatEGP, formatPercent } from '@/lib/utils'
import { http, getToken } from '@/lib/api'
import { animalImage, animalLabel } from '@/lib/animals'

type Project = {
  id: string
  name: string
  animalType: string
  breed: string
  purpose: string
  status: string
  location: string
  sharePrice: number
  fundedPercent: number
  expectedReturn: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  duration: number
  sharesAvailable: number
  cover: string
}

const PURPOSE_AR: Record<string, string> = {
  FATTENING: 'تسمين', DAIRY: 'ألبان', BREEDING: 'تربية', RESALE: 'إعادة بيع',
}

const RISK_STYLES: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
}
const RISK_LABEL: Record<string, string> = { LOW: 'منخفض', MEDIUM: 'متوسط', HIGH: 'مرتفع', CRITICAL: 'حرج' }

function monthsBetween(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0
  const d1 = new Date(a).getTime()
  const d2 = new Date(b).getTime()
  if (!d1 || !d2 || d2 <= d1) return 0
  return Math.max(1, Math.round((d2 - d1) / (30 * 24 * 60 * 60 * 1000)))
}

function mapProject(p: any): Project {
  const target = Number(p.targetAmount ?? 0)
  const funded = Number(p.fundedAmount ?? p.raisedAmount ?? 0)
  const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0
  return {
    id: p.id,
    name: p.name,
    animalType: animalLabel(p.animalType),
    breed: p.breed ?? '—',
    purpose: PURPOSE_AR[p.purpose] ?? p.purpose ?? '—',
    status: p.status,
    location: p.farm?.governorate ?? 'مصر',
    sharePrice: Number(p.sharePrice ?? 0),
    fundedPercent: pct,
    expectedReturn: Number(p.expectedReturnRate ?? 0),
    riskLevel: p.riskLevel ?? 'MEDIUM',
    duration: monthsBetween(p.startDate, p.expectedEndDate),
    sharesAvailable: Math.max(0, (p.availableShares ?? 0)),
    cover: animalImage(p.animalType),
  }
}

export function Opportunities() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await http.get<any>('/projects?page=1&limit=6', {}, getToken)
        const data = Array.isArray(res?.data) ? res.data : []
        if (alive) setProjects(data.map(mapProject))
      } catch {
        if (alive) setProjects([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">فرص الاستثمار</span>
            <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
              مشاريع <span className="text-gradient-gold">موثقة</span> متاحة الآن
            </h2>
            <p className="mt-4 text-muted-foreground">
              كل مشروع يمر بمراجعة بيطرية ومالية وقانونية قبل نشره.
            </p>
          </div>
          <Link href="/opportunities" className="btn-outline shrink-0 group">
            كل الفرص
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {loading && (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-ivory">
                <div className="flex h-48 items-center justify-center text-gold">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
                <div className="space-y-3 p-6">
                  <div className="h-4 w-2/3 rounded bg-primary/10" />
                  <div className="h-3 w-1/2 rounded bg-primary/10" />
                  <div className="h-2 w-full rounded bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-ivory py-16 text-center text-sm text-muted-foreground">
            لا توجد فرص متاحة حاليًا — تابع جديد المشاريع قريبًا.
          </div>
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-hover group overflow-hidden p-0"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent" />
                <div className="absolute right-4 top-4">
                  <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md', RISK_STYLES[p.riskLevel] ?? RISK_STYLES.MEDIUM)}>
                    <ShieldAlert className="h-3 w-3" />
                    مخاطر {RISK_LABEL[p.riskLevel] ?? p.riskLevel}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 left-4">
                  <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {p.animalType} • {p.purpose}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-primary transition-colors group-hover:text-gold-600">
                  {p.name}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.location} • {p.breed}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">نسبة التمويل</span>
                    <span className="font-bold text-gold-600">{p.fundedPercent}٪</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold-400 transition-all duration-1000" style={{ width: `${p.fundedPercent}%` }} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-5 text-center">
                  <div>
                    <div className="text-base font-bold text-primary">{formatPercent(p.expectedReturn)}</div>
                    <div className="text-[10px] text-muted-foreground">عائد سنوي تقديري</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-primary">{p.duration || '—'} شهر</div>
                    <div className="text-[10px] text-muted-foreground">مدة المشروع</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-primary">{formatEGP(p.sharePrice)}</div>
                    <div className="text-[10px] text-muted-foreground">سعر السهم</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    <Clock className="ml-1 inline h-3.5 w-3.5" />
                    {p.sharesAvailable} سهم متاح
                  </span>
                  <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-600 transition-colors hover:text-primary">
                    التفاصيل
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Opportunities
