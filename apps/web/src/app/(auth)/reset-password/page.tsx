'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { http } from '@/lib/api'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '')
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setError('رابط الاستعادة غير صالح، اطلب رابطًا جديدًا')
    if (password.length < 8) return setError('كلمة المرور يجب ألا تقل عن 8 أحرف')
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين')
    setLoading(true)
    setError(null)
    try {
      await http.post('/auth/reset-password', { token, newPassword: password })
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'تعذر تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-xl border border-white/15 bg-white/5 py-3 pr-11 pl-4 text-right text-sm text-white placeholder:text-ivory/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20'

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-950">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative flex min-h-screen flex-col">
        <header className="container-page py-6">
          <Link href="/" aria-label="AZBA"><Logo size={44} variant="light" /></Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-4 pb-28">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white">كلمة مرور جديدة</h1>
              <p className="mt-2 text-sm text-ivory/60">اختر كلمة مرور جديدة لحسابك.</p>
            </div>
            {done ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <p className="mt-4 text-sm text-ivory/80">تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة.</p>
                <Link href="/login" className="btn-gold mt-6 flex items-center justify-center gap-2 py-3">
                  تسجيل الدخول <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                  <input type="password" dir="ltr" autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" className={input} />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                  <input type="password" dir="ltr" autoComplete="new-password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} placeholder="تأكيد كلمة المرور" className={input} />
                </div>
                <button type="submit" disabled={loading} className="btn-gold flex w-full items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                  حفظ كلمة المرور
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
