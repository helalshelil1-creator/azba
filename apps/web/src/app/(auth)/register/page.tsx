'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Loader2, User, Phone, ShieldCheck, Check,
} from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { useAuth } from '@/lib/auth-store'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [accept, setAccept] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (form.firstName.trim().length < 2) errs.firstName = 'الاسم الأول مطلوب'
    if (form.lastName.trim().length < 2) errs.lastName = 'اسم العائلة مطلوب'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'بريد إلكتروني غير صالح'
    if (!/^(\+?2)?01[0-9]{9}$/.test(form.phone)) errs.phone = 'رقم هاتف مصري غير صالح'
    if (form.password.length < 8) errs.password = 'كلمة المرور ٨ أحرف على الأقل'
    else if (!/[A-Z]/.test(form.password)) errs.password = 'يجب أن تحتوي على حرف كبير'
    else if (!/[a-z]/.test(form.password)) errs.password = 'يجب أن تحتوي على حرف صغير'
    else if (!/[0-9]/.test(form.password)) errs.password = 'يجب أن تحتوي على رقم'
    if (form.confirm !== form.password) errs.confirm = 'كلمتا المرور غير متطابقتين'
    if (!accept) errs.accept = 'يجب الموافقة على الشروط وإفصاح المخاطر'
    return errs
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length) return
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        preferredLang: 'ar',
      })
      router.push('/dashboard?welcome=1')
    } catch {
      // handled
    }
  }

  const passwordChecks = [
    { label: '٨ أحرف على الأقل', ok: form.password.length >= 8 },
    { label: 'حرف كبير (A-Z)', ok: /[A-Z]/.test(form.password) },
    { label: 'حرف صغير (a-z)', ok: /[a-z]/.test(form.password) },
    { label: 'رقم (0-9)', ok: /[0-9]/.test(form.password) },
  ]

  return (
    <div className="relative min-h-screen bg-primary-950">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute -top-40 right-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        <header className="container-page py-6">
          <Link href="/" aria-label="AZBA">
            <Logo size={44} variant="light" />
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">أنشئ حسابك المجاني</h1>
                <p className="mt-2 text-sm text-ivory/60">
                  ابدأ رحلتك الاستثمارية في الثروة الحقيقية
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ivory/80">الاسم الأول</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                      <input
                        value={form.firstName}
                        onChange={set('firstName')}
                        placeholder="أحمد"
                        className={cn('input-dark w-full pr-10', fieldErrors.firstName && 'border-red-500/60')}
                      />
                    </div>
                    {fieldErrors.firstName && <p className="mt-1 text-xs text-red-300">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ivory/80">اسم العائلة</label>
                    <input
                      value={form.lastName}
                      onChange={set('lastName')}
                      placeholder="محمد"
                      className={cn('input-dark w-full', fieldErrors.lastName && 'border-red-500/60')}
                    />
                    {fieldErrors.lastName && <p className="mt-1 text-xs text-red-300">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ivory/80">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                    <input
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@example.com"
                      className={cn('input-dark w-full pr-10 text-right', fieldErrors.email && 'border-red-500/60')}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ivory/80">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                    <input
                      dir="ltr"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="01001234567"
                      className={cn('input-dark w-full pr-10 text-right', fieldErrors.phone && 'border-red-500/60')}
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-300">{fieldErrors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ivory/80">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        value={form.password}
                        onChange={set('password')}
                        className={cn('input-dark w-full pr-10 pl-10 text-right', fieldErrors.password && 'border-red-500/60')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory"
                        aria-label="إظهار"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-ivory/80">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      dir="ltr"
                      value={form.confirm}
                      onChange={set('confirm')}
                      className={cn('input-dark w-full text-right', fieldErrors.confirm && 'border-red-500/60')}
                    />
                  </div>
                </div>
                {(fieldErrors.password || fieldErrors.confirm) && (
                  <p className="text-xs text-red-300">{fieldErrors.password || fieldErrors.confirm}</p>
                )}

                {form.password && (
                  <div className="grid grid-cols-2 gap-2">
                    {passwordChecks.map((c) => (
                      <div key={c.label} className={cn('flex items-center gap-1.5 text-xs', c.ok ? 'text-emerald-300' : 'text-ivory/40')}>
                        <Check className={cn('h-3.5 w-3.5', !c.ok && 'opacity-30')} />
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-ivory/60">
                  <input
                    type="checkbox"
                    checked={accept}
                    onChange={(e) => setAccept(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/30"
                  />
                  <span>
                    أوافق على{' '}
                    <Link href="/terms" className="text-gold hover:underline">الشروط والأحكام</Link>
                    {' '}و{' '}
                    <Link href="/disclosures" className="text-gold hover:underline">إفصاح المخاطر</Link>
                    {' '}وأقر بأن الاستثمار في الثروة الحيوانية ينطوي على مخاطر وقد يؤدي إلى خسارة رأس المال.
                  </span>
                </label>
                {fieldErrors.accept && <p className="text-xs text-red-300">{fieldErrors.accept}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 text-base disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                  {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-ivory/50">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                بياناتك محمية ولن تُستخدم إلا لإدارة استثمارك
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-ivory/50">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="font-semibold text-gold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
