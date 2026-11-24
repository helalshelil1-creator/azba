'use client'

import Image from 'next/image'
import { DemoNotice, DEMO_MODE } from '@/components/layout/demo-banner'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, MapPin, ShieldCheck, Loader2, AlertTriangle, Sparkles,
  CheckCircle2, FileText, X, Wallet, BadgeCheck,
} from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { http } from '@/lib/api'
import { useAuth } from '@/lib/auth-store'
import { cn, formatEGP } from '@/lib/utils'
import { animalImage } from '@/lib/animals'
import { findShowcaseProject } from '@/lib/showcase'
import { toast } from 'sonner'
import { PageLogo } from '@/components/layout/page-logo'

interface Project {
  id: string
  code: string
  name: string
  nameEn?: string
  animalType: string
  breed: string
  description?: string
  expectedReturnRate?: any
  riskLevel: string
  status: string
  targetAmount: any
  raisedAmount: any
  fundedAmount?: any
  sharePrice: any
  totalShares: number
  soldShares: number
  reservedShares: number
  minSharesPerInvestor?: number | null
  maxSharesPerInvestor?: number | null
  startDate?: string
  expectedEndDate?: string
  riskDisclosure?: string
  farm?: { name: string; city: string; governorate: string; totalArea?: any; usableArea?: any }
}

const TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة', BEEF_CATTLE: 'أبقار لحم', BUFFALO: 'جاموس',
  GOAT: 'ماعز', SHEEP: 'أغنام', HORSE: 'خيل', CALVES: 'عجول', POULTRY: 'دواجن', FISH: 'أسماك', OTHER: 'أخرى',
}
const RISK_AR: Record<string, { ar: string; cls: string; desc: string }> = {
  LOW: { ar: 'منخفض', cls: 'badge-success', desc: 'مخاطر تشغيلية محدودة' },
  MEDIUM: { ar: 'متوسط', cls: 'badge-warning', desc: 'مخاطر قابلة للإدارة' },
  HIGH: { ar: 'مرتفع', cls: 'badge-danger', desc: 'تقلب أعلى في العوائد' },
  CRITICAL: { ar: 'حرج', cls: 'badge-danger', desc: 'احتمالية خسارة مرتفعة' },
}
const PLATFORM_FEE_PERCENT = 1.5

type Step = 'review' | 'risk' | 'pay' | 'success'

export function ProjectDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shares, setShares] = useState(1)
  const [step, setStep] = useState<Step | null>(null)
  const [acceptContract, setAcceptContract] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [contractNumber, setContractNumber] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await http.get<Project>(`/projects/${id}`)
      setProject(res)
    } catch {
      // الـ API غير متاح: عرض مشروع العرض المطابق لبيانات الـ seed
      const fallback = findShowcaseProject(id)
      if (fallback) setProject(fallback as unknown as Project)
      else setError('تعذر تحميل المشروع')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const startInvest = () => {
    if (!user) {
      router.push(`/login?redirect=/projects/${id}`)
      return
    }
    setStep('review')
  }

  const reserve = async () => {
    setSubmitting(true)
    try {
      const res = await http.post<any>('/investments/reservations', { projectId: id, shareCount: shares })
      setReservationId(res.id)
      setStep('risk')
    } catch (e: any) {
      toast.error(e?.message || 'تعذر حجز الأسهم')
    } finally { setSubmitting(false) }
  }

  const confirm = async () => {
    if (!reservationId) return
    setSubmitting(true)
    try {
      const res = await http.post<any>('/investments/confirm', {
        reservationId,
        paymentMethod: 'SANDBOX',
        acceptContract: true,
      })
      setContractNumber(res.contractNumber)
      setStep('success')
      load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر تأكيد الاستثمار')
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ivory">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
        <p className="text-sm text-muted-foreground">جارٍ تحميل المشروع...</p>
      </div>
    )
  }
  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ivory">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-muted-foreground">{error || 'المشروع غير موجود'}</p>
        <button onClick={load} className="btn-outline text-sm">إعادة المحاولة</button>
      </div>
    )
  }

  const funded = Number(project.fundedAmount ?? project.raisedAmount ?? 0)
  const target = Number(project.targetAmount)
  const price = Number(project.sharePrice)
  const pct = target > 0 ? Math.round((funded / target) * 100) : 0
  const available = Math.max(0, project.totalShares - project.soldShares - project.reservedShares)
  const riskInfo = RISK_AR[project.riskLevel] ?? { ar: project.riskLevel, cls: 'badge-default', desc: '' }
  const minShares = project.minSharesPerInvestor ?? 1
  const maxShares = Math.min(project.maxSharesPerInvestor ?? available, available)
  const gross = price * shares
  const fee = Math.round(gross * (PLATFORM_FEE_PERCENT / 100) * 100) / 100
  const net = Math.round((gross - fee) * 100) / 100

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="container-page pt-24"><DemoNotice /></div>

      <section className="relative overflow-hidden bg-primary-950 py-12 text-white sm:py-16">
        <Image
          src={animalImage(project.animalType)}
          alt={project.name}
          fill
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/70 to-primary-950/40" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-page relative">
          <PageLogo className="mb-6" />
          <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm text-ivory/70 transition-colors hover:text-gold">
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="badge bg-white/15 text-white backdrop-blur">{TYPE_AR[project.animalType] ?? project.animalType}</span>
                <span className={cn('badge', riskInfo.cls)}>مخاطر {riskInfo.ar}</span>
                <span className="badge border border-gold/40 bg-gold/15 text-gold">{project.code}</span>
              </div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">{project.name}</h1>
              {project.nameEn && <p className="mt-1 text-ivory/60" dir="ltr">{project.nameEn}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ivory/70">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" />{project.farm?.name} — {project.farm?.governorate}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <div className="text-[11px] text-ivory/60">العائد المتوقع</div>
                <div className="mt-1 text-lg font-extrabold text-gold sm:text-2xl">{Number(project.expectedReturnRate ?? 0)}٪</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <div className="text-[11px] text-ivory/60">سعر السهم</div>
                <div className="mt-1 text-lg font-extrabold text-white sm:text-2xl">{formatEGP(price)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <div className="text-[11px] text-ivory/60">الأسهم المتاحة</div>
                <div className="mt-1 text-lg font-extrabold text-white sm:text-2xl">{available}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <FileText className="h-5 w-5 text-gold" />
              عن المشروع
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/80">
              {project.description || 'مشروع استثماري في الثروة الحيوانية يدار باحترافية كاملة مع إفصاح دوري للمستثمرين.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <MapPin className="h-5 w-5 text-gold" />
              المزرعة والموقع
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-ivory p-4">
                <div className="text-xs text-muted-foreground">اسم المزرعة</div>
                <div className="mt-1 font-bold text-primary">{project.farm?.name ?? '—'}</div>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <div className="text-xs text-muted-foreground">المحافظة</div>
                <div className="mt-1 font-bold text-primary">{project.farm?.governorate ?? '—'}</div>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <div className="text-xs text-muted-foreground">المساحة الكلية</div>
                <div className="mt-1 font-bold text-primary">{project.farm?.totalArea ? `${project.farm.totalArea} م²` : '—'}</div>
              </div>
              <div className="rounded-xl bg-ivory p-4">
                <div className="text-xs text-muted-foreground">المساحة المستغلة</div>
                <div className="mt-1 font-bold text-primary">{project.farm?.usableArea ? `${project.farm.usableArea} م²` : '—'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-800">
              <ShieldCheck className="h-5 w-5" />
              إفصاح المخاطر
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-800/90">
              {project.riskDisclosure || 'الاستثمار في الثروة الحيوانية ينطوي على مخاطر تشغيلية وصحية وسوقية. مستوى المخاطر لهذا المشروع: ' + riskInfo.ar + ' — ' + riskInfo.desc + '. الأداء السابق لا يضمن النتائج المستقبلية.'}
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">التمويل</h3>
              <span className="badge-gold">{pct}%</span>
            </div>
            <div className="mt-4">
              <div className="h-2.5 overflow-hidden rounded-full bg-ivory">
                <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold-600" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{formatEGP(funded)} مموّل</span>
                <span>الهدف {formatEGP(target)}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-border/60 pt-5">
              {DEMO_MODE && (
                <p className="mb-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs leading-relaxed text-primary">هذه حاسبة للاستعراض فقط. لا يوجد حجز أو دفع في هذه النسخة.</p>
              )}
              <label className="mb-2 block text-xs font-semibold text-primary">عدد الأسهم</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setShares((s) => Math.max(minShares, s - 1))} className="h-11 w-11 rounded-xl border border-border text-lg font-bold text-primary hover:bg-primary/5">−</button>
                <input
                  type="number"
                  min={minShares}
                  max={Math.max(minShares, maxShares)}
                  value={shares}
                  onChange={(e) => setShares(Math.max(minShares, Number(e.target.value)))}
                  className="h-11 w-full rounded-xl border border-border text-center text-lg font-bold text-primary focus:border-gold focus:outline-none"
                />
                <button onClick={() => setShares((s) => Math.min(Math.max(minShares, maxShares), s + 1))} className="h-11 w-11 rounded-xl border border-border text-lg font-bold text-primary hover:bg-primary/5">+</button>
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                الحد الأدنى {minShares} — الحد الأقصى {Math.max(0, maxShares)} سهم
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl bg-ivory p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">سعر السهم</span><span className="font-semibold">{formatEGP(price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">عدد الأسهم</span><span className="font-semibold">{shares}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">رسوم المنصة ({PLATFORM_FEE_PERCENT}٪)</span><span className="font-semibold">{formatEGP(fee)}</span></div>
              <div className="flex justify-between border-t border-border/60 pt-2"><span className="text-muted-foreground">صافي الاستثمار</span><span className="text-lg font-extrabold text-primary">{formatEGP(net)}</span></div>
            </div>

            <button
              onClick={startInvest}
              disabled={available <= 0 || DEMO_MODE}
              className="btn-gold mt-5 flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {DEMO_MODE ? 'للاستعراض فقط، لا يوجد حجز في هذا العرض' : available <= 0 ? 'اكتمل التمويل' : user ? 'استثمر الآن' : 'سجّل الدخول للاستثمار'}
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              لا يتم حجز أسهم أو دفع أو سحب أموال فعلية.
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {step && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-primary-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => !submitting && setStep(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              {step === 'review' && (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-extrabold text-primary">مراجعة الاستثمار</h3>
                    <button onClick={() => setStep(null)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-4 space-y-2 rounded-2xl bg-ivory p-4 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">المشروع</span><span className="font-semibold text-primary">{project.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">عدد الأسهم</span><span className="font-semibold">{shares}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">سعر السهم</span><span className="font-semibold">{formatEGP(price)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي</span><span className="font-semibold">{formatEGP(gross)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">رسوم المنصة</span><span className="font-semibold text-amber-600">{formatEGP(fee)}</span></div>
                    <div className="flex justify-between border-t border-border/60 pt-2"><span className="text-muted-foreground">صافي الاستثمار</span><span className="text-lg font-extrabold text-primary">{formatEGP(net)}</span></div>
                  </div>
                  <button onClick={reserve} disabled={submitting} className="btn-gold mt-5 flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
                    حجز الأسهم
                  </button>
                </>
              )}

              {step === 'risk' && (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-extrabold text-primary">إفصاح المخاطر والعقد</h3>
                    <button onClick={() => setStep(null)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-4 max-h-56 overflow-y-auto rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                    {project.riskDisclosure || 'الاستثمار في الثروة الحيوانية ينطوي على مخاطر تشغيلية وصحية وسوقية.'}
                  </div>
                  <label className="mt-4 flex items-start gap-3 text-sm text-foreground/80">
                    <input type="checkbox" checked={acceptContract} onChange={(e) => setAcceptContract(e.target.checked)} className="mt-1 h-4 w-4 accent-gold" />
                    أقر بأنني قرأت إفصاح المخاطر وأوافق على شروط العقد الإلكتروني للمشروع {project.code}.
                  </label>
                  <button onClick={() => setStep('pay')} disabled={!acceptContract} className="btn-gold mt-5 w-full py-3.5 disabled:opacity-60">
                    متابعة إلى الدفع
                  </button>
                </>
              )}

              {step === 'pay' && (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-extrabold text-primary">الدفع التجريبي</h3>
                    <button onClick={() => setStep(null)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-border/60 p-4 text-center">
                    <div className="text-xs text-muted-foreground">المبلغ المستحق</div>
                    <div className="mt-1 text-3xl font-extrabold text-primary">{formatEGP(net)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{shares} سهم × {formatEGP(price)}</div>
                  </div>
                  <div className="mt-3 rounded-xl bg-ivory p-3 text-[11px] leading-relaxed text-muted-foreground">
                    الدفع يتم في وضع Sandbox التجريبي. لن يتم خصم أي مبلغ حقيقي حتى استكمال الموافقات القانونية والتراخيص.
                  </div>
                  <button onClick={confirm} disabled={submitting} className="btn-gold mt-5 flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />}
                    تأكيد الاستثمار
                  </button>
                </>
              )}

              {step === 'success' && (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-9 w-9 text-success" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-primary">تم الاستثمار بنجاح</h3>
                  <p className="mt-2 text-sm text-muted-foreground">شكرًا لثقتك في AZBA</p>
                  {contractNumber && (
                    <div className="mt-4 rounded-xl bg-ivory p-3 text-xs text-muted-foreground">
                      رقم العقد: <span className="font-bold text-primary" dir="ltr">{contractNumber}</span>
                    </div>
                  )}
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => router.push('/dashboard/portfolio')} className="btn-gold flex-1 py-3">عرض محفظتي</button>
                    <button onClick={() => router.push('/dashboard/projects')} className="btn-outline flex-1 py-3">مشاريعي</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
