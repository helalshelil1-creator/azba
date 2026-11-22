'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight, Stethoscope, Syringe, HeartPulse, RefreshCw, Check, Plus, X,
  Thermometer, Wind, Activity, FileText, ShieldCheck, MapPin, Tag, Building2,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, Field, num, formatDate, StatusBadge, todayInputValue,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

interface VetReport {
  id: string
  reportNumber?: string
  reportType?: string
  examinationDate?: string
  temperature?: any
  heartRate?: number | null
  respiratoryRate?: number | null
  bodyConditionScore?: number | null
  findings?: string | null
  diagnosis?: string | null
  treatmentPlan?: string | null
  recommendations?: string | null
  isApproved?: boolean
  approvedAt?: string | null
  version?: number
  veterinarian?: { firstName?: string; lastName?: string } | null
}

interface HealthRecord {
  id: string
  recordType?: string | null
  title?: string | null
  description?: string | null
  diagnosis?: string | null
  treatment?: string | null
  cost?: any
  startDate?: string | null
  followUpDate?: string | null
}

interface Vaccination {
  id: string
  vaccineName?: string
  vaccineType?: string | null
  manufacturer?: string | null
  batchNumber?: string | null
  administeredAt?: string | null
  nextDueDate?: string | null
  cost?: any
}

interface AnimalDetail {
  id: string
  animalId?: string
  tagNumber?: string | null
  qrCode?: string | null
  breed?: string
  breedEn?: string | null
  type?: string
  gender?: string
  dateOfBirth?: string | null
  weight?: any
  healthStatus?: string
  status?: string
  location?: string | null
  notes?: string | null
  farm?: any
  pen?: any
  project?: { id?: string; name?: string; code?: string; status?: string } | null
  weightRecords?: any[]
  healthRecords?: HealthRecord[]
  vaccinations?: Vaccination[]
  veterinaryReports?: VetReport[]
}

interface ReportForm {
  reportType: string
  examinationDate: string
  temperature: string
  heartRate: string
  respiratoryRate: string
  findings: string
  diagnosis: string
  treatmentPlan: string
  recommendations: string
}

const emptyReport: ReportForm = {
  reportType: 'ROUTINE_CHECKUP',
  examinationDate: todayInputValue(),
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  findings: '',
  diagnosis: '',
  treatmentPlan: '',
  recommendations: '',
}

const TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة',
  BEEF_CATTLE: 'أبقار لحم',
  BUFFALO: 'جاموس',
  GOAT: 'ماعز',
  SHEEP: 'أغنام', HORSE: 'خيل', CALVES: 'عجول',
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

const RECORD_TYPE_AR: Record<string, string> = {
  EXAMINATION: 'فحص',
  VACCINATION: 'لقاح',
  MEDICATION: 'دواء',
  TREATMENT: 'علاج',
  SURGERY: 'جراحة',
  LAB_TEST: 'تحليل',
  CHECKUP: 'متابعة',
}

const REPORT_TYPE_AR: Record<string, string> = {
  ROUTINE_CHECKUP: 'فحص دوري',
  EMERGENCY: 'طوارئ',
  PRE_PURCHASE: 'قبل الشراء',
  PRE_SALE: 'قبل البيع',
  MORTALITY: 'وفاة',
  OUTBREAK: 'تفشي وباء',
}

export function AnimalDetailClient() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [animal, setAnimal] = useState<AnimalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ReportForm>(emptyReport)

  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setError('معرّف الحيوان غير متوفر')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<AnimalDetail>(`/animals/${id}`, {}, getToken)
      setAnimal(res ?? null)
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل ملف الحيوان')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const update = <K extends keyof ReportForm>(key: K, value: ReportForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!id) { setFormError('معرّف الحيوان غير متوفر'); return }
    if (!form.examinationDate) { setFormError('يرجى تحديد تاريخ الفحص'); return }
    if (!form.findings.trim()) { setFormError('يرجى إدخال النتائج السريرية'); return }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        animalId: id,
        reportType: form.reportType,
        examinationDate: form.examinationDate,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        heartRate: form.heartRate ? Math.round(Number(form.heartRate)) : undefined,
        respiratoryRate: form.respiratoryRate ? Math.round(Number(form.respiratoryRate)) : undefined,
        findings: form.findings.trim(),
        diagnosis: form.diagnosis.trim() || undefined,
        treatmentPlan: form.treatmentPlan.trim() || undefined,
        recommendations: form.recommendations.trim() || undefined,
      }
      await http.post('/animals/vet-reports', payload, {}, getToken)
      setSuccess('تم إنشاء التقرير البيطري بنجاح')
      setForm(emptyReport)
      setShowForm(false)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'تعذر إنشاء التقرير البيطري')
    } finally {
      setSubmitting(false)
    }
  }

  const approveReport = async (reportId: string) => {
    setApprovingId(reportId)
    setActionError(null)
    setSuccess(null)
    try {
      await http.patch(`/animals/vet-reports/${reportId}/approve`, {}, {}, getToken)
      setSuccess('تم اعتماد التقرير البيطري')
      await load()
    } catch (err: any) {
      setActionError(err?.message || 'تعذر اعتماد التقرير')
    } finally {
      setApprovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="ملف الحيوان" subtitle="جارٍ تحميل السجل الصحي..." icon={Stethoscope} />
        <div className="card">
          <LoadingState label="جارٍ تحميل ملف الحيوان..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="ملف الحيوان" icon={Stethoscope} />
        <div className="card">
          <ErrorState message={error} onRetry={load} />
        </div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="space-y-6">
        <PageHeader title="ملف الحيوان" icon={Stethoscope} />
        <div className="card">
          <EmptyState icon={Stethoscope} title="لم يتم العثور على الحيوان" hint="قد يكون المعرّف غير صحيح أو تم حذف السجل" />
        </div>
      </div>
    )
  }

  const healthRecords: HealthRecord[] = Array.isArray(animal.healthRecords) ? animal.healthRecords : []
  const vaccinations: Vaccination[] = Array.isArray(animal.vaccinations) ? animal.vaccinations : []
  const reports: VetReport[] = Array.isArray(animal.veterinaryReports) ? animal.veterinaryReports : []
  const weightRecords: any[] = Array.isArray(animal.weightRecords) ? animal.weightRecords : []
  const lastWeight = weightRecords[0]?.weight ?? animal.weight
  const health = HEALTH_AR[String(animal.healthStatus)]
  const status = STATUS_AR[String(animal.status)]

  return (
    <div className="space-y-6">
      <PageHeader
        title={animal.tagNumber || animal.animalId || 'ملف حيوان'}
        subtitle={`${TYPE_AR[String(animal.type)] || String(animal.type || '—')} — ${animal.breed || '—'}`}
        icon={Stethoscope}
        actions={
          <>
            <Link href="/dashboard/vet" className="btn-outline text-xs">
              <ArrowRight className="h-4 w-4" />
              العودة للبحث
            </Link>
            <button
              onClick={load}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </>
        }
      />

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {/* Profile */}
      <div className="card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <HeartPulse className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {health && <StatusBadge label={health.ar} tone={health.tone} />}
                {status && <StatusBadge label={status.ar} tone={status.tone} />}
                <StatusBadge label={animal.gender === 'MALE' ? 'ذكر' : animal.gender === 'FEMALE' ? 'أنثى' : String(animal.gender || '—')} tone="default" />
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-gold" />
                  <span dir="ltr">{animal.animalId}</span>
                  {animal.qrCode && <span dir="ltr">— QR: {animal.qrCode}</span>}
                </div>
                {(animal.farm?.name || animal.pen?.name) && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gold" />
                    {animal.farm?.name || '—'}
                    {animal.pen?.name ? ` / ${animal.pen.name}` : ''}
                  </div>
                )}
                {animal.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {animal.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-ivory px-4 py-3">
              <div className="text-[11px] text-muted-foreground">العمر</div>
              <div className="mt-1 text-sm font-bold text-primary">
                {animal.dateOfBirth ? formatDate(animal.dateOfBirth) : '—'}
              </div>
            </div>
            <div className="rounded-xl bg-ivory px-4 py-3">
              <div className="text-[11px] text-muted-foreground">الوزن الحالي</div>
              <div className="mt-1 text-sm font-bold text-primary">
                {lastWeight !== undefined && lastWeight !== null ? `${formatNumber(num(lastWeight))} كجم` : '—'}
              </div>
            </div>
            <div className="rounded-xl bg-ivory px-4 py-3">
              <div className="text-[11px] text-muted-foreground">المشروع</div>
              <div className="mt-1 text-sm font-bold text-primary">{animal.project?.name || '—'}</div>
            </div>
          </div>
        </div>
        {animal.notes && (
          <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-gold-800">
            {animal.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowForm((v) => !v)} className="btn-gold">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'إغلاق النموذج' : 'تقرير بيطري جديد'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3 className="font-bold text-primary">إنشاء تقرير بيطري</h3>
          <form onSubmit={submitReport} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="نوع التقرير" required>
              <select
                className="input-field"
                value={form.reportType}
                onChange={(e) => update('reportType', e.target.value)}
              >
                {Object.entries(REPORT_TYPE_AR).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="تاريخ الفحص" required>
              <input
                type="date"
                className="input-field"
                value={form.examinationDate}
                onChange={(e) => update('examinationDate', e.target.value)}
              />
            </Field>
            <Field label="درجة الحرارة (°م)">
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={form.temperature}
                onChange={(e) => update('temperature', e.target.value)}
                placeholder="38.5"
              />
            </Field>
            <Field label="ضربات القلب">
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.heartRate}
                onChange={(e) => update('heartRate', e.target.value)}
                placeholder="60"
              />
            </Field>
            <Field label="معدل التنفس">
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.respiratoryRate}
                onChange={(e) => update('respiratoryRate', e.target.value)}
                placeholder="30"
              />
            </Field>
            <Field label="النتائج السريرية" required className="sm:col-span-2 lg:col-span-3">
              <textarea
                className="input-field min-h-[90px]"
                value={form.findings}
                onChange={(e) => update('findings', e.target.value)}
                placeholder="وصف النتائج السريرية والحالة العامة"
              />
            </Field>
            <Field label="التشخيص" className="sm:col-span-2 lg:col-span-3">
              <textarea
                className="input-field min-h-[70px]"
                value={form.diagnosis}
                onChange={(e) => update('diagnosis', e.target.value)}
                placeholder="التشخيص المبدئي أو النهائي"
              />
            </Field>
            <Field label="خطة العلاج" className="sm:col-span-2 lg:col-span-3">
              <textarea
                className="input-field min-h-[70px]"
                value={form.treatmentPlan}
                onChange={(e) => update('treatmentPlan', e.target.value)}
                placeholder="الأدوية والجرعات ومدة العلاج"
              />
            </Field>
            <Field label="التوصيات" className="sm:col-span-2 lg:col-span-3">
              <textarea
                className="input-field min-h-[70px]"
                value={form.recommendations}
                onChange={(e) => update('recommendations', e.target.value)}
                placeholder="توصيات المتابعة والنظافة والتغذية"
              />
            </Field>
            {formError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? 'جارٍ الحفظ...' : 'حفظ التقرير'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Vet reports */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h3 className="font-bold text-primary">التقارير البيطرية</h3>
          <span className="text-xs text-muted-foreground">{reports.length} تقرير</span>
        </div>
        {reports.length === 0 ? (
          <EmptyState icon={FileText} title="لا توجد تقارير بيطرية" hint="أنشئ أول تقرير بيطري لهذا الحيوان" />
        ) : (
          <div className="space-y-4 p-4">
            {reports.map((r) => (
              <div key={r?.id} className="rounded-xl border border-border/60 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-primary">{REPORT_TYPE_AR[String(r?.reportType)] || String(r?.reportType || 'تقرير')}</span>
                      {r?.isApproved ? (
                        <StatusBadge label="معتمد" tone="success" />
                      ) : (
                        <StatusBadge label="غير معتمد" tone="warning" />
                      )}
                      {r?.version && r.version > 1 && <StatusBadge label={`إصدار ${formatNumber(r.version)}`} tone="default" />}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(r?.examinationDate)}
                      {r?.veterinarian ? ` — الطبيب: ${r.veterinarian.firstName || ''} ${r.veterinarian.lastName || ''}`.trim() : ''}
                      {r?.reportNumber ? ` — ${r.reportNumber}` : ''}
                    </div>
                  </div>
                  {!r?.isApproved && (
                    <button
                      onClick={() => approveReport(r!.id)}
                      disabled={approvingId === r?.id}
                      className="btn-outline shrink-0 px-4 py-2 text-xs disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {approvingId === r?.id ? 'جارٍ الاعتماد...' : 'اعتماد التقرير'}
                    </button>
                  )}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-ivory px-3 py-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground"><Thermometer className="h-3.5 w-3.5" /> الحرارة</div>
                    <div className="mt-1 font-bold text-primary">{r?.temperature !== undefined && r?.temperature !== null ? `${formatNumber(num(r.temperature))}°م` : '—'}</div>
                  </div>
                  <div className="rounded-lg bg-ivory px-3 py-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground"><HeartPulse className="h-3.5 w-3.5" /> ضربات القلب</div>
                    <div className="mt-1 font-bold text-primary">{r?.heartRate ?? '—'}</div>
                  </div>
                  <div className="rounded-lg bg-ivory px-3 py-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground"><Wind className="h-3.5 w-3.5" /> معدل التنفس</div>
                    <div className="mt-1 font-bold text-primary">{r?.respiratoryRate ?? '—'}</div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="mb-1 font-semibold text-primary">النتائج السريرية</div>
                    <p className="leading-relaxed text-muted-foreground">{r?.findings || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="mb-1 font-semibold text-primary">التشخيص</div>
                    <p className="leading-relaxed text-muted-foreground">{r?.diagnosis || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="mb-1 font-semibold text-primary">خطة العلاج</div>
                    <p className="leading-relaxed text-muted-foreground">{r?.treatmentPlan || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <div className="mb-1 font-semibold text-primary">التوصيات</div>
                    <p className="leading-relaxed text-muted-foreground">{r?.recommendations || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health history */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h3 className="font-bold text-primary">السجل الصحي</h3>
          <span className="text-xs text-muted-foreground">{healthRecords.length} سجل</span>
        </div>
        {healthRecords.length === 0 ? (
          <EmptyState icon={Activity} title="لا يوجد سجل صحي" hint="لم يتم تسجيل أي حالات صحية بعد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                  <th className="px-6 py-3 text-right font-semibold">النوع</th>
                  <th className="px-6 py-3 text-right font-semibold">العنوان</th>
                  <th className="px-6 py-3 text-right font-semibold">التشخيص</th>
                  <th className="px-6 py-3 text-right font-semibold">العلاج</th>
                  <th className="px-6 py-3 text-right font-semibold">التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {healthRecords.map((h) => (
                  <tr key={h?.id} className="border-b border-border/40 hover:bg-ivory/40">
                    <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(h?.startDate)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={RECORD_TYPE_AR[String(h?.recordType)] || String(h?.recordType || '—')}
                        tone="default"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">{h?.title || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{h?.diagnosis || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{h?.treatment || '—'}</td>
                    <td className="px-6 py-4">{num(h?.cost) ? formatEGP(num(h.cost)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vaccinations */}
      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h3 className="font-bold text-primary">اللقاحات</h3>
          <span className="text-xs text-muted-foreground">{vaccinations.length} لقاح</span>
        </div>
        {vaccinations.length === 0 ? (
          <EmptyState icon={Syringe} title="لا توجد لقاحات مسجلة" hint="لم يتم تسجيل أي لقاح لهذا الحيوان" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                  <th className="px-6 py-3 text-right font-semibold">اللقاح</th>
                  <th className="px-6 py-3 text-right font-semibold">النوع</th>
                  <th className="px-6 py-3 text-right font-semibold">الشركة</th>
                  <th className="px-6 py-3 text-right font-semibold">رقم الدفعة</th>
                  <th className="px-6 py-3 text-right font-semibold">الموعد القادم</th>
                  <th className="px-6 py-3 text-right font-semibold">التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map((v) => (
                  <tr key={v?.id} className="border-b border-border/40 hover:bg-ivory/40">
                    <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(v?.administeredAt)}</td>
                    <td className="px-6 py-4 font-semibold text-primary">{v?.vaccineName || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{v?.vaccineType || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{v?.manufacturer || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground" dir="ltr">{v?.batchNumber || '—'}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(v?.nextDueDate)}</td>
                    <td className="px-6 py-4">{num(v?.cost) ? formatEGP(num(v.cost)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
