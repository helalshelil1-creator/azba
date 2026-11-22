'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Loader2, PawPrint, Plus, RefreshCw, Search, X,
} from 'lucide-react'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  ANIMAL_TYPE, ANIMAL_TYPE_OPTIONS, Animal, EmptyState, ErrorState, FARM_STATUS, Farm, GENDER, HEALTH_STATUS,
  Loading, Meta, PageHeader, Paged, Pen, StatusBadge, Tag, formatNumber, getToken, num, postTolerant, qty,
} from '../_ui'

const LIMIT = 10

const EMPTY_FORM = {
  farmId: '',
  penId: '',
  tagNumber: '',
  type: 'DAIRY_COW',
  breed: '',
  gender: 'FEMALE',
  weight: '',
  purchasePrice: '',
  purchaseDate: '',
}

export function AnimalsClient() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: LIMIT, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [farmId, setFarmId] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const [farms, setFarms] = useState<Farm[]>([])
  const [pens, setPens] = useState<Pen[]>([])

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debounced, farmId])

  // Farms for the filter + the register form
  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const res = await http.get<Paged<Farm>>('/farms', { params: { page: 1, limit: 100 } }, getToken)
        if (!alive) return
        const anyRes = res as any
        const list: Farm[] = Array.isArray(res?.data) ? res.data : Array.isArray(anyRes?.items) ? anyRes.items : []
        setFarms(list)
      } catch {
        if (alive) setFarms([])
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [refreshKey])

  // Pens for the selected farm in the register form
  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!form.farmId) {
        setPens([])
        return
      }
      try {
        const farm = await http.get<Farm>(`/farms/${form.farmId}`, {}, getToken)
        if (alive) setPens(Array.isArray(farm?.pens) ? farm.pens : [])
      } catch {
        if (alive) setPens([])
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [form.farmId])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await http.get<Paged<Animal>>(
          '/animals',
          { params: { page, limit: LIMIT, search: debounced || undefined, farmId: farmId || undefined } },
          getToken,
        )
        if (!alive) return
        const anyRes = res as any
        const list: Animal[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(anyRes?.items)
            ? anyRes.items
            : []
        const m = res?.meta
        setAnimals(list)
        setMeta({
          page: m?.page ?? page,
          limit: m?.limit ?? LIMIT,
          total: m?.total ?? list.length,
          totalPages: m?.totalPages,
          hasNext: m?.hasNext,
          hasPrev: m?.hasPrev,
        })
      } catch (e: any) {
        if (alive) setError(e?.message || 'تعذر تحميل الحيوانات')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [page, debounced, farmId, refreshKey])

  const setField = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const createAnimal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const body: Record<string, unknown> = {
        farmId: form.farmId,
        tagNumber: form.tagNumber.trim(),
        type: form.type,
        breed: form.breed.trim(),
        gender: form.gender,
      }
      if (form.penId) body.penId = form.penId
      if (form.weight.trim()) body.purchaseWeight = Number(form.weight)
      if (form.purchasePrice.trim()) body.purchasePrice = Number(form.purchasePrice)
      if (form.purchaseDate) body.purchaseDate = form.purchaseDate
      await postTolerant<Animal>('/animals', body)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setFormError(e?.message || 'تعذر تسجيل الحيوان')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(meta.total / meta.limit))
  const hasPrev = meta.hasPrev ?? page > 1
  const hasNext = meta.hasNext ?? page < totalPages

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحيوانات"
        subtitle="سجل الحيوانات وبياناتها الأساسية"
        actions={
          <>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
            </button>
            <button onClick={() => setShowForm((v) => !v)} className="btn-gold">
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'إغلاق' : 'تسجيل حيوان'}
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالمعرّف أو السلالة أو رقم الوسم..."
            className="input-field pr-10"
          />
        </div>
        <select value={farmId} onChange={(e) => setFarmId(e.target.value)} className="input-field sm:max-w-xs">
          <option value="">كل المزارع</option>
          {farms.map((f) => (
            <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-bold text-primary">تسجيل حيوان جديد</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            الحقول المعلّمة بـ <span className="text-destructive">*</span> مطلوبة. يتم توليد المعرّف ورمز QR تلقائيًا.
          </p>
          <form onSubmit={createAnimal} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">المزرعة <span className="text-destructive">*</span></label>
              <select className="input-field" value={form.farmId} onChange={setField('farmId')} required>
                <option value="">اختر المزرعة</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الحظيرة</label>
              <select className="input-field" value={form.penId} onChange={setField('penId')} disabled={!form.farmId}>
                <option value="">بدون حظيرة</option>
                {pens.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">رقم الوسم <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.tagNumber} onChange={setField('tagNumber')} required dir="ltr" />
            </div>
            <div>
              <label className="label">النوع <span className="text-destructive">*</span></label>
              <select className="input-field" value={form.type} onChange={setField('type')}>
                {ANIMAL_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">السلالة <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.breed} onChange={setField('breed')} required />
            </div>
            <div>
              <label className="label">الجنس <span className="text-destructive">*</span></label>
              <select className="input-field" value={form.gender} onChange={setField('gender')}>
                <option value="FEMALE">أنثى</option>
                <option value="MALE">ذكر</option>
              </select>
            </div>
            <div>
              <label className="label">الوزن (كجم)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.weight} onChange={setField('weight')} dir="ltr" />
            </div>
            <div>
              <label className="label">سعر الشراء (ج.م)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={setField('purchasePrice')} dir="ltr" />
            </div>
            <div>
              <label className="label">تاريخ الشراء</label>
              <input className="input-field" type="date" value={form.purchaseDate} onChange={setField('purchaseDate')} dir="ltr" />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'جارٍ التسجيل...' : 'تسجيل الحيوان'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">إلغاء</button>
            </div>
          </form>
          {formError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
        </div>
      )}

      {loading ? (
        <Loading label="جارٍ تحميل الحيوانات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
      ) : animals.length === 0 ? (
        <EmptyState
          title="لا توجد حيوانات"
          description="سجّل أول حيوان أو عدّل بحثك"
          action={
            <button onClick={() => setShowForm(true)} className="btn-gold text-sm">
              <Plus className="h-4 w-4" /> تسجيل حيوان
            </button>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
                    <th className="px-5 py-3 text-right font-semibold">المعرّف</th>
                    <th className="px-5 py-3 text-right font-semibold">النوع</th>
                    <th className="px-5 py-3 text-right font-semibold">السلالة</th>
                    <th className="px-5 py-3 text-right font-semibold">الجنس</th>
                    <th className="px-5 py-3 text-right font-semibold">الوزن</th>
                    <th className="px-5 py-3 text-right font-semibold">الحالة</th>
                    <th className="px-5 py-3 text-right font-semibold">المزرعة</th>
                    <th className="px-5 py-3 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map((a) => (
                    <tr key={a.id} className="border-b border-border/40 last:border-0 hover:bg-ivory/40">
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/farm/animals/${a.id}`} className="font-semibold text-primary hover:text-gold-600" dir="ltr">
                          {a.animalId}
                        </Link>
                        {a.tagNumber && <div className="text-[11px] text-muted-foreground" dir="ltr">{a.tagNumber}</div>}
                      </td>
                      <td className="px-5 py-3">{ANIMAL_TYPE[(a.type ?? '').toUpperCase()] ?? a.type ?? '—'}</td>
                      <td className="px-5 py-3 text-foreground/80">{a.breed || '—'}</td>
                      <td className="px-5 py-3">{GENDER[(a.gender ?? '').toUpperCase()] ?? a.gender ?? '—'}</td>
                      <td className="px-5 py-3 font-semibold text-primary">
                        {a.weight != null ? `${formatNumber(num(a.weight))} كجم` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge value={a.healthStatus} map={HEALTH_STATUS} />
                      </td>
                      <td className="px-5 py-3 text-foreground/80">{a.farm?.name || '—'}</td>
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/farm/animals/${a.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-primary">
                          <PawPrint className="h-3.5 w-3.5" />
                          الملف
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              عرض {formatNumber(animals.length)} من إجمالي {formatNumber(meta.total)} حيوان
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev || loading}
                className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </button>
              <span className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-primary">
                صفحة {formatNumber(meta.page)} من {formatNumber(totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || loading}
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
  )
}
