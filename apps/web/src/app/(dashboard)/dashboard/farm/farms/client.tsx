'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, ChevronLeft, ChevronRight, Loader2, MapPin, Plus, RefreshCw, Search, X,
} from 'lucide-react'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  EmptyState, ErrorState, Farm, FARM_STATUS, Loading, Meta, PageHeader, Paged, StatusBadge,
  formatNumber, getToken, num, postTolerant, qty,
} from '../_ui'

const LIMIT = 10

const EMPTY_FORM = {
  name: '',
  code: '',
  address: '',
  city: '',
  governorate: '',
  totalArea: '',
  usableArea: '',
}

export function FarmsClient() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: LIMIT, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
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
  }, [debounced])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await http.get<Paged<Farm>>(
          '/farms',
          { params: { page, limit: LIMIT, search: debounced || undefined } },
          getToken,
        )
        if (!alive) return
        const anyRes = res as any
        const list: Farm[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(anyRes?.items)
            ? anyRes.items
            : []
        const m = res?.meta
        setFarms(list)
        setMeta({
          page: m?.page ?? page,
          limit: m?.limit ?? LIMIT,
          total: m?.total ?? list.length,
          totalPages: m?.totalPages,
          hasNext: m?.hasNext,
          hasPrev: m?.hasPrev,
        })
      } catch (e: any) {
        if (alive) setError(e?.message || 'تعذر تحميل المزارع')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [page, debounced, refreshKey])

  const setField = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const createFarm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        governorate: form.governorate.trim(),
      }
      if (form.code.trim()) body.code = form.code.trim()
      if (form.totalArea.trim()) body.totalArea = Number(form.totalArea)
      if (form.usableArea.trim()) body.usableArea = Number(form.usableArea)
      await postTolerant<Farm>('/farms', body)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setFormError(e?.message || 'تعذر إنشاء المزرعة')
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
        title="المزارع"
        subtitle="إدارة المزارع ومبانيها وحظائرها وحيواناتها"
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
              {showForm ? 'إغلاق' : 'إنشاء مزرعة'}
            </button>
          </>
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو الكود أو المحافظة..."
          className="input-field pr-10"
        />
      </div>

      {showForm && (
        <div className="card">
          <h3 className="text-lg font-bold text-primary">إنشاء مزرعة جديدة</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            الحقول المعلّمة بـ <span className="text-destructive">*</span> مطلوبة. يُمكن ترك الكود فارغًا لتوليده تلقائيًا.
          </p>
          <form onSubmit={createFarm} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">اسم المزرعة <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.name} onChange={setField('name')} required />
            </div>
            <div>
              <label className="label">الكود</label>
              <input className="input-field" value={form.code} onChange={setField('code')} dir="ltr" />
            </div>
            <div>
              <label className="label">المحافظة <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.governorate} onChange={setField('governorate')} required />
            </div>
            <div>
              <label className="label">المدينة <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.city} onChange={setField('city')} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">العنوان <span className="text-destructive">*</span></label>
              <input className="input-field" value={form.address} onChange={setField('address')} required />
            </div>
            <div>
              <label className="label">المساحة الكلية (م²)</label>
              <input className="input-field" type="number" min="0" value={form.totalArea} onChange={setField('totalArea')} dir="ltr" />
            </div>
            <div>
              <label className="label">المساحة المستغلة (م²)</label>
              <input className="input-field" type="number" min="0" value={form.usableArea} onChange={setField('usableArea')} dir="ltr" />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'جارٍ الإنشاء...' : 'إنشاء المزرعة'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                إلغاء
              </button>
            </div>
          </form>
          {formError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</p>
          )}
        </div>
      )}

      {loading ? (
        <Loading label="جارٍ تحميل المزارع..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
      ) : farms.length === 0 ? (
        <EmptyState
          title="لا توجد مزارع"
          description="ابدأ بإنشاء أول مزرعة أو عدّل بحثك"
          action={
            <button onClick={() => setShowForm(true)} className="btn-gold text-sm">
              <Plus className="h-4 w-4" /> إنشاء مزرعة
            </button>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
                    <th className="px-5 py-3 text-right font-semibold">اسم المزرعة</th>
                    <th className="px-5 py-3 text-right font-semibold">الكود</th>
                    <th className="px-5 py-3 text-right font-semibold">المحافظة</th>
                    <th className="px-5 py-3 text-right font-semibold">الحالة</th>
                    <th className="px-5 py-3 text-right font-semibold">الحيوانات</th>
                    <th className="px-5 py-3 text-right font-semibold">الحظائر</th>
                    <th className="px-5 py-3 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {farms.map((farm) => (
                    <tr key={farm.id} className="border-b border-border/40 last:border-0 hover:bg-ivory/40">
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/farm/farms/${farm.id}`} className="font-semibold text-primary hover:text-gold-600">
                          {farm.name}
                        </Link>
                        {farm.city && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {farm.city}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3" dir="ltr">
                        <span className="rounded-md bg-ivory px-2 py-1 text-xs font-semibold text-primary">{farm.code}</span>
                      </td>
                      <td className="px-5 py-3 text-foreground/80">{farm.governorate || '—'}</td>
                      <td className="px-5 py-3">
                        <StatusBadge value={farm.status} map={FARM_STATUS} />
                      </td>
                      <td className="px-5 py-3 font-semibold text-primary">{qty(farm._count?.animals)}</td>
                      <td className="px-5 py-3 font-semibold text-primary">{qty(farm._count?.pens)}</td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/farm/farms/${farm.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-primary"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          التفاصيل
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
              عرض {formatNumber(farms.length)} من إجمالي {formatNumber(meta.total)} مزرعة
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
