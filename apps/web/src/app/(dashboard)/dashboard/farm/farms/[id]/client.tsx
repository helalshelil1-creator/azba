'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, ChevronLeft, Loader2, MapPin, PawPrint, Plus, RefreshCw, Ruler, Users, X,
} from 'lucide-react'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Animal, BUILDING_TYPE, Building as BuildingType, EmptyState, ErrorState, FARM_STATUS, FLOOR_TYPE, Farm, GENDER,
  HEALTH_STATUS, Loading, PageHeader, Paged, PEN_TYPE, Pen, SectionCard, StatusBadge, Tag,
  formatNumber, getToken, num, postTolerant, qty,
} from '../../_ui'

const EMPTY_BUILDING = { name: '', code: '', type: 'PEN', area: '', capacity: '' }
const EMPTY_PEN = { name: '', code: '', type: 'FATTENING', capacity: '', area: '', floorType: '', buildingId: '' }

export function FarmDetailClient({ id }: { id: string }) {
  const [farm, setFarm] = useState<Farm | null>(null)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showBuilding, setShowBuilding] = useState(false)
  const [buildingBusy, setBuildingBusy] = useState(false)
  const [buildingError, setBuildingError] = useState<string | null>(null)
  const [building, setBuilding] = useState(EMPTY_BUILDING)

  const [showPen, setShowPen] = useState(false)
  const [penBusy, setPenBusy] = useState(false)
  const [penError, setPenError] = useState<string | null>(null)
  const [pen, setPen] = useState(EMPTY_PEN)

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await http.get<Farm>(`/farms/${id}`, {}, getToken)
        if (!alive) return
        setFarm(data)
        try {
          const list = await http.get<Paged<Animal>>(
            '/animals',
            { params: { page: 1, limit: 50, farmId: id } },
            getToken,
          )
          if (!alive) return
          setAnimals(Array.isArray(list?.data) ? list.data : [])
        } catch {
          if (!alive) return
          setAnimals(Array.isArray((data as any)?.animals) ? (data as any).animals : [])
        }
      } catch (e: any) {
        if (alive) setError(e?.message || 'تعذر تحميل المزرعة')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [id, refreshKey])

  const setBuildingField = (key: keyof typeof EMPTY_BUILDING) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setBuilding((f) => ({ ...f, [key]: e.target.value }))

  const setPenField = (key: keyof typeof EMPTY_PEN) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setPen((f) => ({ ...f, [key]: e.target.value }))

  const createBuilding = async (e: React.FormEvent) => {
    e.preventDefault()
    setBuildingBusy(true)
    setBuildingError(null)
    try {
      const body: Record<string, unknown> = {
        name: building.name.trim(),
        code: building.code.trim(),
        type: building.type,
      }
      if (building.area.trim()) body.area = Number(building.area)
      if (building.capacity.trim()) body.capacity = Number(building.capacity)
      await postTolerant<BuildingType>(`/farms/${id}/buildings`, body)
      setBuilding(EMPTY_BUILDING)
      setShowBuilding(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setBuildingError(e?.message || 'تعذر إضافة المبنى')
    } finally {
      setBuildingBusy(false)
    }
  }

  const createPen = async (e: React.FormEvent) => {
    e.preventDefault()
    setPenBusy(true)
    setPenError(null)
    try {
      const body: Record<string, unknown> = {
        name: pen.name.trim(),
        code: pen.code.trim(),
        type: pen.type,
        capacity: Number(pen.capacity),
      }
      if (pen.area.trim()) body.area = Number(pen.area)
      if (pen.floorType) body.floorType = pen.floorType
      if (pen.buildingId) body.buildingId = pen.buildingId
      await postTolerant<Pen>(`/farms/${id}/pens`, body)
      setPen(EMPTY_PEN)
      setShowPen(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setPenError(e?.message || 'تعذر إضافة الحظيرة')
    } finally {
      setPenBusy(false)
    }
  }

  if (loading) return <Loading label="جارٍ تحميل المزرعة..." />
  if (error || !farm) return <ErrorState message={error || 'المزرعة غير موجودة'} onRetry={() => setRefreshKey((k) => k + 1)} />

  const buildings = farm.buildings ?? []
  const pens = farm.pens ?? []
  const manager = farm.manager ? `${farm.manager.firstName ?? ''} ${farm.manager.lastName ?? ''}`.trim() : '—'

  const stats = [
    { label: 'الحيوانات', value: farm._count?.animals ?? animals.length, icon: PawPrint },
    { label: 'الحظائر', value: farm._count?.pens ?? pens.length, icon: Building2 },
    { label: 'المباني', value: farm._count?.buildings ?? buildings.length, icon: Building2 },
    { label: 'المشاريع', value: farm._count?.projects ?? 0, icon: Users },
    { label: 'الموظفون', value: farm._count?.employees ?? 0, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={farm.name}
        subtitle={`${farm.code} — ${farm.city || '—'} / ${farm.governorate || '—'}`}
        actions={
          <>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
            </button>
            <Link href="/dashboard/farm/animals" className="btn-outline text-sm">
              <ChevronLeft className="h-4 w-4" />
              كل الحيوانات
            </Link>
          </>
        }
      />

      {/* Farm overview */}
      <div className="card bg-primary text-ivory">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs text-ivory/60" dir="ltr">{farm.code}</div>
            <h3 className="mt-1 text-2xl font-extrabold">{farm.name}</h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ivory/70">
              <MapPin className="h-4 w-4 text-gold" />
              {farm.address || '—'} — {farm.city || '—'} — {farm.governorate || '—'}
            </div>
          </div>
          <StatusBadge value={farm.status} map={FARM_STATUS} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <s.icon className="mx-auto h-4 w-4 text-gold" />
              <div className="mt-1.5 text-xl font-bold">{qty(s.value)}</div>
              <div className="text-[10px] text-ivory/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-xs text-muted-foreground">المساحة الكلية</div>
          <div className="mt-1 text-xl font-bold text-primary">{farm.totalArea ? `${formatNumber(num(farm.totalArea))} م²` : '—'}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted-foreground">المساحة المستغلة</div>
          <div className="mt-1 text-xl font-bold text-primary">{farm.usableArea ? `${formatNumber(num(farm.usableArea))} م²` : '—'}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted-foreground">مدير المزرعة</div>
          <div className="mt-1 text-sm font-bold text-primary">{manager}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted-foreground">رقم الرخصة</div>
          <div className="mt-1 text-sm font-bold text-primary">{farm.licenseNumber || '—'}</div>
        </div>
      </div>

      {/* Buildings & pens */}
      <SectionCard
        title="المباني والحظيرات"
        subtitle={`${formatNumber(buildings.length)} مبنى و ${formatNumber(pens.length)} حظيرة`}
        actions={
          <>
            <button onClick={() => setShowBuilding((v) => !v)} className="btn-outline text-sm">
              {showBuilding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showBuilding ? 'إغلاق' : 'إضافة مبنى'}
            </button>
            <button onClick={() => setShowPen((v) => !v)} className="btn-gold text-sm">
              {showPen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showPen ? 'إغلاق' : 'إضافة حظيرة'}
            </button>
          </>
        }
      >
        {showBuilding && (
          <form onSubmit={createBuilding} className="mb-5 grid gap-4 rounded-2xl border border-border/60 bg-ivory/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">اسم المبنى <span className="text-destructive">*</span></label>
              <input className="input-field" value={building.name} onChange={setBuildingField('name')} required />
            </div>
            <div>
              <label className="label">الكود <span className="text-destructive">*</span></label>
              <input className="input-field" value={building.code} onChange={setBuildingField('code')} required dir="ltr" />
            </div>
            <div>
              <label className="label">النوع <span className="text-destructive">*</span></label>
              <select className="input-field" value={building.type} onChange={setBuildingField('type')}>
                {Object.entries(BUILDING_TYPE).map(([value, info]) => (
                  <option key={value} value={value}>{info.ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">المساحة (م²)</label>
              <input className="input-field" type="number" min="0" value={building.area} onChange={setBuildingField('area')} dir="ltr" />
            </div>
            <div>
              <label className="label">السعة</label>
              <input className="input-field" type="number" min="0" value={building.capacity} onChange={setBuildingField('capacity')} dir="ltr" />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={buildingBusy} className="btn-gold text-sm disabled:opacity-50">
                {buildingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                إضافة المبنى
              </button>
              <button type="button" onClick={() => setShowBuilding(false)} className="btn-outline text-sm">إلغاء</button>
            </div>
            {buildingError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-4">{buildingError}</p>
            )}
          </form>
        )}

        {showPen && (
          <form onSubmit={createPen} className="mb-5 grid gap-4 rounded-2xl border border-border/60 bg-ivory/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">اسم الحظيرة <span className="text-destructive">*</span></label>
              <input className="input-field" value={pen.name} onChange={setPenField('name')} required />
            </div>
            <div>
              <label className="label">الكود <span className="text-destructive">*</span></label>
              <input className="input-field" value={pen.code} onChange={setPenField('code')} required dir="ltr" />
            </div>
            <div>
              <label className="label">النوع <span className="text-destructive">*</span></label>
              <select className="input-field" value={pen.type} onChange={setPenField('type')}>
                {Object.entries(PEN_TYPE).map(([value, info]) => (
                  <option key={value} value={value}>{info.ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">السعة <span className="text-destructive">*</span></label>
              <input className="input-field" type="number" min="1" value={pen.capacity} onChange={setPenField('capacity')} required dir="ltr" />
            </div>
            <div>
              <label className="label">نوع الأرضية</label>
              <select className="input-field" value={pen.floorType} onChange={setPenField('floorType')}>
                <option value="">بدون</option>
                {Object.entries(FLOOR_TYPE).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">المساحة (م²)</label>
              <input className="input-field" type="number" min="0" value={pen.area} onChange={setPenField('area')} dir="ltr" />
            </div>
            <div>
              <label className="label">المبنى</label>
              <select className="input-field" value={pen.buildingId} onChange={setPenField('buildingId')}>
                <option value="">بدون مبنى</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={penBusy} className="btn-gold text-sm disabled:opacity-50">
                {penBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                إضافة الحظيرة
              </button>
              <button type="button" onClick={() => setShowPen(false)} className="btn-outline text-sm">إلغاء</button>
            </div>
            {penError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-4">{penError}</p>
            )}
          </form>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
              <Building2 className="h-4 w-4 text-gold" />
              المباني
            </h4>
            {buildings.length === 0 ? (
              <EmptyState title="لا توجد مبانٍ" description="أضف أول مبنى للمزرعة" />
            ) : (
              <div className="space-y-3">
                {buildings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border/60 bg-ivory/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-primary">{b.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{b.code}</div>
                      </div>
                      <Tag value={b.type} map={Object.fromEntries(Object.entries(BUILDING_TYPE).map(([k, v]) => [k, v.ar]))} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {b.area != null && (
                        <span className="inline-flex items-center gap-1">
                          <Ruler className="h-3.5 w-3.5" />
                          {formatNumber(num(b.area))} م²
                        </span>
                      )}
                      {b.capacity != null && <span>السعة: {formatNumber(b.capacity)}</span>}
                      <span>الحظائر: {formatNumber(b._count?.pens ?? 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
              <Building2 className="h-4 w-4 text-gold" />
              الحظائر
            </h4>
            {pens.length === 0 ? (
              <EmptyState title="لا توجد حظائر" description="أضف أول حظيرة للمزرعة" />
            ) : (
              <div className="space-y-3">
                {pens.map((p) => {
                  const current = p.currentCount ?? p._count?.animals ?? 0
                  const capacity = p.capacity ?? 0
                  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0
                  return (
                    <div key={p.id} className="rounded-xl border border-border/60 bg-ivory/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-primary">{p.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{p.code}</div>
                        </div>
                        <Tag value={p.type} map={Object.fromEntries(Object.entries(PEN_TYPE).map(([k, v]) => [k, v.ar]))} />
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>الإشغال</span>
                          <span className="font-semibold text-primary">
                            {formatNumber(current)} / {formatNumber(capacity)} ({formatNumber(pct)}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white">
                          <div
                            className={cn('h-full rounded-full', pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-primary')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                          {p.floorType && <span>الأرضية: {FLOOR_TYPE[p.floorType] ?? p.floorType}</span>}
                          {p.area != null && <span>المساحة: {formatNumber(num(p.area))} م²</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Animals */}
      <SectionCard
        title="الحيوانات"
        subtitle={`${formatNumber(animals.length)} حيوان في هذه المزرعة`}
        actions={
          <Link href={`/dashboard/farm/animals?farmId=${farm.id}`} className="btn-outline text-sm">
            عرض الكل
          </Link>
        }
      >
        {animals.length === 0 ? (
          <EmptyState title="لا توجد حيوانات" description="لم يتم تسجيل أي حيوان في هذه المزرعة بعد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-right font-semibold">المعرّف</th>
                  <th className="px-4 py-3 text-right font-semibold">النوع</th>
                  <th className="px-4 py-3 text-right font-semibold">السلالة</th>
                  <th className="px-4 py-3 text-right font-semibold">الجنس</th>
                  <th className="px-4 py-3 text-right font-semibold">الوزن</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {animals.map((a) => (
                  <tr key={a.id} className="border-b border-border/40 last:border-0 hover:bg-ivory/40">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/farm/animals/${a.id}`} className="font-semibold text-primary hover:text-gold-600" dir="ltr">
                        {a.animalId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{a.type || '—'}</td>
                    <td className="px-4 py-3 text-foreground/80">{a.breed || '—'}</td>
                    <td className="px-4 py-3">{GENDER[(a.gender ?? '').toUpperCase()] ?? a.gender ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {a.weight != null ? `${formatNumber(num(a.weight))} كجم` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.healthStatus} map={HEALTH_STATUS} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/farm/animals/${a.id}`} className="text-xs font-bold text-gold-600 hover:text-primary">
                        الملف
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
