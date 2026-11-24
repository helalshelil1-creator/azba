'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { useAuth } from '@/lib/auth-store'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const errs: Record<string, string> = {}
    if (!email) errs.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'بريد إلكتروني غير صالح'
    if (!password) errs.password = 'كلمة المرور مطلوبة'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-950">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="container-page flex justify-center pb-2 pt-8 sm:pt-10">
          <Link href="/" aria-label="AZBA">
            <Logo size={112} variant="light" className="max-h-28 sm:max-h-32" />
          </Link>
        </header>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">مرحبًا بعودتك</h1>
                <p className="mt-2 text-sm text-ivory/60">
                  سجّل دخولك لمتابعة محفظتك الاستثمارية
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ivory/80">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={cn(
                        'w-full rounded-xl border border-white/15 bg-white/5 py-3 pr-11 pl-4 text-right text-sm text-white placeholder:text-ivory/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20',
                        fieldErrors.email && 'border-red-500/60'
                      )}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-red-300">{fieldErrors.email}</p>}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-medium text-ivory/80">كلمة المرور</label>
                    <Link href="/forgot-password" className="text-xs text-gold hover:underline">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'w-full rounded-xl border border-white/15 bg-white/5 py-3 pr-11 pl-11 text-right text-sm text-white placeholder:text-ivory/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20',
                        fieldErrors.password && 'border-red-500/60'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory"
                      aria-label="إظهار كلمة المرور"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-1.5 text-xs text-red-300">{fieldErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3.5 text-base disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                  {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-ivory/50">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                اتصال آمن ومشفر. كلمات المرور تُحفظ مجزّأة (hash) ولا تُحفظ كنص
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-ivory/50">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="font-semibold text-gold hover:underline">
                أنشئ حسابًا مجانيًا
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
