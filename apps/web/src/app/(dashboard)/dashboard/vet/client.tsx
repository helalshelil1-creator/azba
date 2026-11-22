'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  QrCode, Search, RefreshCw, ChevronLeft, ChevronRight, MapPin, Tag, HeartPulse, Building2,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, num, StatusBadge,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

interface AnimalItem {
  id: string
  animalId?: string
  tagNumber?: string | null
  qrCode?: string | null
  breed?: string
  breedEn?: string | null
  type?: string
  gender?: string
  weight?: any
  healthStatus?: string
  status?: string
  farm?: { name?: string; city?: string; governorate?: string } | null
  pen?: { name?: string; code?: string } | null
  media?: any[]
  weightRecords?: any[]
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
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

const HEALTH_AR: Record<string, { ar: string; tone: string }> = {
  HEALTHY: { ar: 'سليم', tone: 'success' },
  UNDER_TREATMENT: { ar: 'تحت العلاج', tone: 'warning' },
  SICK: { ar: 'مريض', tone: 'danger' },
  QUARANTINE: { ar: 'حجر صحي', tone: 'info' },
  DECEASED: { ar: 'متوفي', tone: 'danger' },
}

const STATUS_AR: Record<string, { ar: string; tone: string }> = {
  ACTIVE: { ar: 'نشط', tone: 'success' },
  SOLD: { ar: 'مباع', tone: 'default' },
  DECEASED: { ar: 'متوفي', tone: 'danger' },
  TRANSFERRED: { ar: 'منقول', tone: 'info' },
}

const LIMIT = 12

export function VetSearchClient() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [animals, setAnimals] = useState<AnimalItem[]>([])
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [qr, setQr] = useState('')
  const [qrResult, setQrResult] = useState<AnimalItem | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  const load = useCallback(async (p = page, term = search) => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<{ data?: AnimalItem[]; meta?: Meta }>(
        '/animals',
        { params: { search: term, page: p, limit: LIMIT } },
        getToken,
      )
      setAnimals(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { page: p, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل الحيوانات')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    load(page, search)
  }, [load, page, search])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQrResult(null)
    setQrError(null)
    setPage(1)
    setSearch(q.trim())
  }

  const submitQr = async (e: React.FormEvent) => {
    e.preventDefault()
    setQrError(null)
    setQrResult(null)
    const code = qr.trim()
    if (!code) { setQrError('يرجى إدخال رمز QR'); return }
    setQrLoading(true)
    try {
      const res = await http.get<AnimalItem>(`/animals/qr/${encodeURIComponent(code)}`, {}, getToken)
      setQrResult(res ?? null)
    } catch (err: any) {
      setQrError(err?.message || 'لم يتم العثور على حيوان بهذا الرمز')
    } finally {
      setQrLoading(false)
    }
  }

  const detailHref = (a: AnimalItem) => `/dashboard/vet/animals/${a?.id}`

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحيوانات"
        subtitle="البحث في سجلات القطيع بالاسم أو الرقم أو رمز QR"
        icon={QrCode}
        actions={
          <button
            onClick={() => load(page, search)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
            aria-label="تحديث"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="card">
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث برقم الحيوان أو البطاقة أو السلالة..."
              className="input-field pr-10"
            />
          </div>
          <button type="submit" className="btn-primary">بحث</button>
        </form>

        <div className="my-4 border-t border-border/60" />

        <form onSubmit={submitQr} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <QrCode className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder="مسح رمز QR أو إدخال الرمز يدويًا"
              className="input-field pr-10"
              dir="ltr"
            />
          </div>
          <button type="submit" disabled={qrLoading} className="btn-gold">
            {qrLoading ? 'جارٍ البحث...' : 'بحث بالـ QR'}
          </button>
        </form>

        {qrError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {qrError}
          </div>
        )}

        {qrResult && (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs text-muted-foreground">نتيجة رمز QR</div>
                <div className="mt-1 font-bold text-primary">
                  {qrResult?.tagNumber || qrResult?.animalId || 'حيوان'}
                  {qrResult?.breed ? ` — ${qrResult.breed}` : ''}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge
                    label={TYPE_AR[String(qrResult?.type)] || String(qrResult?.type || '—')}
                    tone="default"
                  />
                  {qrResult?.healthStatus && (
                    <StatusBadge
                      label={HEALTH_AR[String(qrResult.healthStatus)]?.ar || String(qrResult.healthStatus)}
                      tone={HEALTH_AR[String(qrResult.healthStatus)]?.tone || 'default'}
                    />
                  )}
                </div>
              </div>
              <Link href={detailHref(qrResult)} className="btn-gold shrink-0">عرض الملف</Link>
            </div>
          </div>
        )}
      </div>

      <div className="card p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل الحيوانات..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(page, search)} />
        ) : animals.length === 0 ? (
          <EmptyState
            icon={Search}
            title="لا توجد نتائج مطابقة"
            hint="جرّب تعديل كلمة البحث أو مسح رمز QR الصحيح"
          />
        ) : (
          <>
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((a) => {
                const health = HEALTH_AR[String(a?.healthStatus)]
                const status = STATUS_AR[String(a?.status)]
                const lastWeight = Array.isArray(a?.weightRecords) ? a.weightRecords[0]?.weight : a?.weight
                return (
                  <Link
                    key={a?.id}
                    href={detailHref(a)}
                    className="group rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground" dir="ltr">{a?.animalId}</div>
                        <div className="mt-0.5 text-lg font-bold text-primary">
                          {a?.tagNumber || a?.animalId || 'حيوان'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {TYPE_AR[String(a?.type)] || String(a?.type || '—')} — {a?.breed || '—'}
                        </div>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        <Tag className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {health && <StatusBadge label={health.ar} tone={health.tone} />}
                      {status && <StatusBadge label={status.ar} tone={status.tone} />}
                      {a?.gender && <StatusBadge label={a.gender === 'MALE' ? 'ذكر' : 'أنثى'} tone="default" />}
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gold" />
                        {a?.farm?.name || '—'}
                        {a?.pen?.name ? ` / ${a.pen.name}` : ''}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" />
                        {a?.farm?.city || a?.farm?.governorate || 'مصر'}
                      </div>
                      {lastWeight !== undefined && lastWeight !== null && (
                        <div className="flex items-center gap-1.5">
                          <HeartPulse className="h-3.5 w-3.5 text-gold" />
                          آخر وزن: {formatNumber(num(lastWeight))} كجم
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
              <span>
                صفحة {meta.page} من {Math.max(1, meta.totalPages)} — {formatNumber(meta.total)} حيوان
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrev}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNext}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
