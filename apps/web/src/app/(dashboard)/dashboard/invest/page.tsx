'use client'

import Image from 'next/image'
import { DemoNotice, DEMO_MODE } from '@/components/layout/demo-banner'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, Search, MapPin, Users, Sparkles } from 'lucide-react'
import { http } from '@/lib/api'
import { getToken } from '@/lib/api'
import { cn, formatEGP } from '@/lib/utils'
import { animalImage } from '@/lib/animals'

const TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة', BEEF_CATTLE: 'أبقار لحم', BUFFALO: 'جاموس',
  GOAT: 'ماعز', SHEEP: 'أغنام', HORSE: 'خيل', CALVES: 'عجول', POULTRY: 'دواجن', FISH: 'أسماك', OTHER: 'أخرى',
}
const RISK: Record<string, { ar: string; cls: string }> = {
  LOW: { ar: 'منخفض', cls: 'badge-success' },
  MEDIUM: { ar: 'متوسط', cls: 'badge-warning' },
  HIGH: { ar: 'مرتفع', cls: 'badge-danger' },
  CRITICAL: { ar: 'حرج', cls: 'badge-danger' },
}

interface Project {
  id: string; code: string; name: string; animalType: string; breed: string
  status: string; riskLevel: string; expectedReturnRate: any; sharePrice: any
  targetAmount: any; fundedAmount: any; raisedAmount: any
  totalShares: number; soldShares: number; reservedShares: number
  farm?: { name: string; governorate: string }
}

export default function InvestPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [animalType, setAnimalType] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', '1'); params.set('limit', '50')
      if (search) params.set('search', search)
      if (animalType) params.set('animalType', animalType)
      if (status) params.set('status', status)
      const res = await http.get<any>(`/projects?${params.toString()}`, {}, getToken)
      setProjects(res?.data ?? [])
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل الفرص')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, animalType, status])

  return (
    <div className="space-y-6">
      <DemoNotice />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">فرص الاستثمار</h1>
          <p className="mt-1 text-sm text-muted-foreground">تصفّح المشاريع المعروضة وقارن بينها.</p>
        </div>
        <Link href="/opportunities" className="btn-outline text-sm">المقارنة والتفاصيل</Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المشروع أو السلالة..."
            className="input-field pr-10"
          />
        </div>
        <select value={animalType} onChange={(e) => setAnimalType(e.target.value)} className="input-field sm:w-48">
          <option value="">كل الأنواع</option>
          {Object.entries(TYPE_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-44">
          <option value="">كل الحالات</option>
          <option value="FUNDING">قيد التمويل</option>
          <option value="FUNDED">مموّل</option>
          <option value="ACTIVE">نشط</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
          <span className="text-sm text-muted-foreground">جارٍ تحميل الفرص...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-20">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="btn-outline text-sm">إعادة المحاولة</button>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center text-sm text-muted-foreground">
          لا توجد فرص مطابقة حاليًا.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const funded = Number(p.fundedAmount ?? p.raisedAmount ?? 0)
          const target = Number(p.targetAmount ?? 0)
          const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0
          const available = Math.max(0, p.totalShares - p.soldShares - p.reservedShares)
          const risk = RISK[p.riskLevel] ?? { ar: p.riskLevel, cls: 'badge-default' }
          return (
            <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden">
                <Image src={animalImage(p.animalType)} alt={p.name} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />
                <span className={cn('badge absolute right-4 top-4', risk.cls)}>مخاطر {risk.ar}</span>
              </div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="badge bg-primary/5 text-primary">{TYPE_AR[p.animalType] ?? p.animalType}</span>
              </div>
              <h3 className="text-lg font-bold text-primary">{p.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                {p.farm?.name ?? '—'} — {p.farm?.governorate ?? '—'}
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>التمويل {pct}٪</span>
                  <span>متاح {available} سهم</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ivory">
                  <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold-600" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-ivory p-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">سعر السهم</div>
                  <div className="text-sm font-bold text-primary">{formatEGP(Number(p.sharePrice))}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">العائد المتوقع</div>
                  <div className="text-sm font-bold text-gold">{Number(p.expectedReturnRate ?? 0)}٪</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">الأسهم الكلية</div>
                  <div className="text-sm font-bold text-primary">{p.totalShares}</div>
                </div>
              </div>

              <Link
                href={`/projects/${p.id}`}
                className={cn(
                  'mt-5 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors',
                  available > 0 ? 'btn-gold' : 'bg-ivory text-muted-foreground'
                )}
              >
                {DEMO_MODE ? 'عرض التفاصيل' : available > 0 ? <><Sparkles className="h-4 w-4" /> استثمر الآن</> : 'اكتمل التمويل'}
              </Link>
            </div>
          )
        })}
      </div>

    </div>
  )
}
