'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity, ChevronLeft, HeartPulse, Loader2, MapPin, PawPrint, Plus, QrCode, RefreshCw, Scale, Syringe, X,
} from 'lucide-react'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  ANIMAL_TYPE, ANIMAL_STATUS, Animal, EmptyState, ErrorState, GENDER, HEALTH_RECORD_TYPE, HEALTH_RECORD_TYPE_OPTIONS,
  HEALTH_STATUS, Loading, PageHeader, SectionCard, StatusBadge, Tag, WEIGHT_METHOD, WEIGHT_METHOD_OPTIONS,
  formatAge, formatDate, formatNumber, getToken, money, num, postTolerant, qty,
} from '../../_ui'

const EMPTY_WEIGHT = { weight: '', method: 'SCALE', recordedAt: '' }
const EMPTY_HEALTH = { recordType: 'EXAMINATION', title: '', description: '', cost: '', startDate: '' }
const EMPTY_VACCINE = { vaccineName: '', administeredAt: '', nextDueDate: '', cost: '' }

export function AnimalDetailClient({ id }: { id: string }) {
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [showWeight, setShowWeight] = useState(false)
  const [weightBusy, setWeightBusy] = useState(false)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [weight, setWeight] = useState(EMPTY_WEIGHT)

  const [showHealth, setShowHealth] = useState(false)
  const [healthBusy, setHealthBusy] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [health, setHealth] = useState(EMPTY_HEALTH)

  const [showVaccine, setShowVaccine] = useState(false)
  const [vaccineBusy, setVaccineBusy] = useState(false)
  const [vaccineError, setVaccineError] = useState<string | null>(null)
  const [vaccine, setVaccine] = useState(EMPTY_VACCINE)

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await http.get<Animal>(`/animals/${id}`, {}, getToken)
        if (alive) setAnimal(data)
      } catch (e: any) {
        if (alive) setError(e?.message || 'تعذر تحميل الحيوان')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [id, refreshKey])

  const setWeightField = (key: keyof typeof EMPTY_WEIGHT) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setWeight((f) => ({ ...f, [key]: e.target.value }))
  const setHealthField = (key: keyof typeof EMPTY_HEALTH) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setHealth((f) => ({ ...f, [key]: e.target.value }))
  const setVaccineField = (key: keyof typeof EMPTY_VACCINE) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVaccine((f) => ({ ...f, [key]: e.target.value }))

  const submitWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animal) return
    setWeightBusy(true)
    setWeightError(null)
    try {
      const body: Record<string, unknown> = {
        animalId: animal.id,
        weight: Number(weight.weight),
        method: weight.method,
      }
      if (weight.recordedAt) body.recordedAt = weight.recordedAt
      await postTolerant('/animals/weights', body)
      setWeight(EMPTY_WEIGHT)
      setShowWeight(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setWeightError(e?.message || 'تعذر تسجيل الوزن')
    } finally {
      setWeightBusy(false)
    }
  }

  const submitHealth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animal) return
    setHealthBusy(true)
    setHealthError(null)
    try {
      const body: Record<string, unknown> = {
        animalId: animal.id,
        recordType: health.recordType,
        title: health.title.trim(),
        startDate: health.startDate || new Date().toISOString().slice(0, 10),
      }
      if (health.description.trim()) body.description = health.description.trim()
      if (health.cost.trim()) body.cost = Number(health.cost)
      await postTolerant('/animals/health-records', body)
      setHealth(EMPTY_HEALTH)
      setShowHealth(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setHealthError(e?.message || 'تعذر تسجيل الحالة الصحية')
    } finally {
      setHealthBusy(false)
    }
  }

  const submitVaccine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animal) return
    setVaccineBusy(true)
    setVaccineError(null)
    try {
      const body: Record<string, unknown> = {
        animalId: animal.id,
        vaccineName: vaccine.vaccineName.trim(),
        administeredAt: vaccine.administeredAt || new Date().toISOString().slice(0, 10),
      }
      if (vaccine.nextDueDate) body.nextDueDate = vaccine.nextDueDate
      if (vaccine.cost.trim()) body.cost = Number(vaccine.cost)
      await postTolerant('/animals/vaccinations', body)
      setVaccine(EMPTY_VACCINE)
      setShowVaccine(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      setVaccineError(e?.message || 'تعذر تسجيل اللقاح')
    } finally {
      setVaccineBusy(false)
    }
  }

  if (loading) return <Loading label="جارٍ تحميل ملف الحيوان..." />
  if (error || !animal) return <ErrorState message={error || 'الحيوان غير موجود'} onRetry={() => setRefreshKey((k) => k + 1)} />

  const weights = animal.weightRecords ?? []
  const healthRecords = animal.healthRecords ?? []
  const vaccinations = animal.vaccinations ?? []
  const qrImage = animal.qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(animal.qrCode)}`
    : null

  const profile = [
    { label: 'النوع', value: ANIMAL_TYPE[(animal.type ?? '').toUpperCase()] ?? animal.type ?? '—' },
    { label: 'السلالة', value: animal.breed || '—' },
    { label: 'الجنس', value: GENDER[(animal.gender ?? '').toUpperCase()] ?? animal.gender ?? '—' },
    { label: 'العمر', value: formatAge(animal.ageMonths, animal.dateOfBirth) },
    { label: 'الوزن الحالي', value: animal.weight != null ? `${formatNumber(num(animal.weight))} كجم` : '—' },
    { label: 'رقم الوسم', value: animal.tagNumber || '—' },
    { label: 'تاريخ الشراء', value: formatDate(animal.purchaseDate) },
    { label: 'سعر الشراء', value: animal.purchasePrice != null ? money(animal.purchasePrice) : '—' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`ملف الحيوان ${animal.animalId}`}
        subtitle={`${animal.farm?.name || '—'} / ${animal.pen?.name || '—'}`}
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

      {/* Digital profile */}
      <div className="card">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3">
            {qrImage ? (
              <img src={qrImage} alt={`QR ${animal.animalId}`} className="h-32 w-32 rounded-2xl border border-border/60" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-border/60 bg-ivory">
                <QrCode className="h-10 w-10 text-primary/20" />
              </div>
            )}
            <span className="badge badge-gold">
              <QrCode className="h-3.5 w-3.5" />
              رمز QR
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={animal.healthStatus} map={HEALTH_STATUS} />
              <StatusBadge value={animal.status} map={ANIMAL_STATUS} />
            </div>
            <h3 className="mt-2 text-2xl font-extrabold text-primary" dir="ltr">
              {animal.animalId}
            </h3>
            {animal.qrCode && (
              <p className="mt-1 break-all text-xs text-muted-foreground" dir="ltr">{animal.qrCode}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                {animal.farm?.name || '—'} — {animal.farm?.governorate || '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <PawPrint className="h-3.5 w-3.5 text-gold" />
                {animal.pen?.name || 'بدون حظيرة'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {profile.map((p) => (
                <div key={p.label} className="rounded-xl bg-ivory/60 p-3">
                  <div className="text-[11px] text-muted-foreground">{p.label}</div>
                  <div className="mt-1 text-sm font-bold text-primary" dir={p.label === 'رقم الوسم' ? 'ltr' : undefined}>
                    {p.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weight records */}
      <SectionCard
        title="سجل الأوزان"
        subtitle={`${formatNumber(weights.length)} قياس مسجّل`}
        actions={
          <button onClick={() => setShowWeight((v) => !v)} className="btn-gold text-sm">
            {showWeight ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showWeight ? 'إغلاق' : 'تسجيل وزن'}
          </button>
        }
      >
        {showWeight && (
          <form onSubmit={submitWeight} className="mb-5 grid gap-4 rounded-2xl border border-border/60 bg-ivory/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">الوزن (كجم) <span className="text-destructive">*</span></label>
              <input className="input-field" type="number" min="1" step="0.01" value={weight.weight} onChange={setWeightField('weight')} required dir="ltr" />
            </div>
            <div>
              <label className="label">طريقة القياس</label>
              <select className="input-field" value={weight.method} onChange={setWeightField('method')}>
                {WEIGHT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">التاريخ</label>
              <input className="input-field" type="date" value={weight.recordedAt} onChange={setWeightField('recordedAt')} dir="ltr" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={weightBusy} className="btn-gold text-sm disabled:opacity-50">
                {weightBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                تسجيل
              </button>
            </div>
            {weightError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-4">{weightError}</p>
            )}
          </form>
        )}

        {weights.length === 0 ? (
          <EmptyState title="لا توجد أوزان مسجلة" description="سجّل أول قياس للحيوان" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold">الوزن</th>
                  <th className="px-4 py-3 text-right font-semibold">الطريقة</th>
                  <th className="px-4 py-3 text-right font-semibold">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.id} className="border-b border-border/40 last:border-0 hover:bg-ivory/40">
                    <td className="px-4 py-3 text-foreground/80">{formatDate(w.recordedAt)}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {w.weight != null ? `${formatNumber(num(w.weight))} كجم` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Tag value={w.method} map={WEIGHT_METHOD} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{w.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Health records */}
      <SectionCard
        title="السجلات الصحية"
        subtitle={`${formatNumber(healthRecords.length)} سجل مسجّل`}
        actions={
          <button onClick={() => setShowHealth((v) => !v)} className="btn-gold text-sm">
            {showHealth ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showHealth ? 'إغلاق' : 'تسجيل حالة صحية'}
          </button>
        }
      >
        {showHealth && (
          <form onSubmit={submitHealth} className="mb-5 grid gap-4 rounded-2xl border border-border/60 bg-ivory/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">نوع السجل <span className="text-destructive">*</span></label>
              <select className="input-field" value={health.recordType} onChange={setHealthField('recordType')}>
                {HEALTH_RECORD_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">العنوان <span className="text-destructive">*</span></label>
              <input className="input-field" value={health.title} onChange={setHealthField('title')} required />
            </div>
            <div>
              <label className="label">التكلفة (ج.م)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={health.cost} onChange={setHealthField('cost')} dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">الوصف</label>
              <textarea className="input-field min-h-[88px]" value={health.description} onChange={setHealthField('description')} />
            </div>
            <div>
              <label className="label">تاريخ البدء</label>
              <input className="input-field" type="date" value={health.startDate} onChange={setHealthField('startDate')} dir="ltr" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={healthBusy} className="btn-gold text-sm disabled:opacity-50">
                {healthBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartPulse className="h-4 w-4" />}
                تسجيل
              </button>
            </div>
            {healthError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-3">{healthError}</p>
            )}
          </form>
        )}

        {healthRecords.length === 0 ? (
          <EmptyState title="لا توجد سجلات صحية" description="سجّل أول حالة صحية للحيوان" />
        ) : (
          <div className="space-y-3">
            {healthRecords.map((h) => (
              <div key={h.id} className="rounded-xl border border-border/60 bg-ivory/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-primary">{h.title || '—'}</div>
                    {h.description && <p className="mt-1 text-sm text-foreground/80">{h.description}</p>}
                  </div>
                  <Tag
                    value={h.recordType}
                    map={Object.fromEntries(Object.entries(HEALTH_RECORD_TYPE).map(([k, v]) => [k, v.ar]))}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-gold" />
                    {formatDate(h.startDate)}
                  </span>
                  {h.diagnosis && <span>التشخيص: {h.diagnosis}</span>}
                  {h.treatment && <span>العلاج: {h.treatment}</span>}
                  {h.cost != null && <span>التكلفة: {money(h.cost)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Vaccinations */}
      <SectionCard
        title="اللقاحات"
        subtitle={`${formatNumber(vaccinations.length)} لقاح مسجّل`}
        actions={
          <button onClick={() => setShowVaccine((v) => !v)} className="btn-gold text-sm">
            {showVaccine ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showVaccine ? 'إغلاق' : 'تسجيل لقاح'}
          </button>
        }
      >
        {showVaccine && (
          <form onSubmit={submitVaccine} className="mb-5 grid gap-4 rounded-2xl border border-border/60 bg-ivory/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">اسم اللقاح <span className="text-destructive">*</span></label>
              <input className="input-field" value={vaccine.vaccineName} onChange={setVaccineField('vaccineName')} required />
            </div>
            <div>
              <label className="label">تاريخ الإعطاء</label>
              <input className="input-field" type="date" value={vaccine.administeredAt} onChange={setVaccineField('administeredAt')} dir="ltr" />
            </div>
            <div>
              <label className="label">تاريخ الاستحقاق القادم</label>
              <input className="input-field" type="date" value={vaccine.nextDueDate} onChange={setVaccineField('nextDueDate')} dir="ltr" />
            </div>
            <div>
              <label className="label">التكلفة (ج.م)</label>
              <input className="input-field" type="number" min="0" step="0.01" value={vaccine.cost} onChange={setVaccineField('cost')} dir="ltr" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <button type="submit" disabled={vaccineBusy} className="btn-gold text-sm disabled:opacity-50">
                {vaccineBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Syringe className="h-4 w-4" />}
                تسجيل اللقاح
              </button>
            </div>
            {vaccineError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-4">{vaccineError}</p>
            )}
          </form>
        )}

        {vaccinations.length === 0 ? (
          <EmptyState title="لا توجد لقاحات مسجلة" description="سجّل أول لقاح للحيوان" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/60 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-right font-semibold">اللقاح</th>
                  <th className="px-4 py-3 text-right font-semibold">تاريخ الإعطاء</th>
                  <th className="px-4 py-3 text-right font-semibold">الاستحقاق القادم</th>
                  <th className="px-4 py-3 text-right font-semibold">التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map((v) => {
                  const overdue = v.nextDueDate ? new Date(v.nextDueDate).getTime() < Date.now() : false
                  return (
                    <tr key={v.id} className="border-b border-border/40 last:border-0 hover:bg-ivory/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary">{v.vaccineName || '—'}</div>
                        {v.manufacturer && <div className="text-[11px] text-muted-foreground">{v.manufacturer}</div>}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{formatDate(v.administeredAt)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('font-semibold', overdue ? 'text-red-600' : 'text-primary')}>
                          {formatDate(v.nextDueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{v.cost != null ? money(v.cost) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
