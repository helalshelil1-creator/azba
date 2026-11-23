'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, AnimatePresence } from './framer'
import {
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Play,
  ChevronDown,
  Leaf,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4'

const STATS = [
  { value: '+18%', label: 'أرباح محققة', sub: 'عائد سنوي تقديري', icon: TrendingUp },
  { value: '25,000', label: 'ج.م استثمارات', sub: 'إجمالي متراكم', icon: Sparkles },
  { value: '3', label: 'مشاريع نشطة', sub: 'متاحة للاستثمار', icon: Leaf },
]

export function HeroSection() {
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onCanPlay = () => setVideoReady(true)
    const onError = () => {
      setVideoFailed(true)
      setShowFallback(true)
    }

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)

    // Safety: if video hasn't loaded in 8s, show fallback
    const timer = setTimeout(() => {
      if (!videoReady) setShowFallback(true)
    }, 8000)

    return () => {
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      clearTimeout(timer)
    }
  }, [videoReady])

  return (
    <section className="relative w-full overflow-hidden bg-primary-950 min-h-[100svh]">
      {/* Video Background */}
      {!videoFailed && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            videoReady ? 'opacity-100' : 'opacity-0'
          )}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}

      {/* Fallback image / gradient */}
      {showFallback && (
        <div className="absolute inset-0">
          <img
            src="/images/cattle.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-primary-950/40 to-primary-950/90" />
      <div className="absolute inset-0 bg-gradient-to-l from-primary-950/60 via-transparent to-primary-950/30" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="container-page flex flex-1 flex-col items-center justify-center pt-12 text-center sm:pt-16 lg:pt-24">

          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-5 sm:mb-7"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AZBA | عزبة"
              draggable={false}
              className="mx-auto h-24 w-auto sm:h-32"
            />
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="max-w-4xl text-balance text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ fontFamily: 'var(--font-tajawal)' }}
          >
            استثمر في{' '}
            <span className="text-gradient-gold">الثروة الحقيقية</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4 max-w-2xl text-balance text-base text-ivory/85 sm:text-xl lg:text-2xl"
          >
            من المزرعة إلى محفظتك الاستثمارية.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-3 max-w-3xl text-balance text-sm leading-relaxed text-ivory/60 sm:text-base"
          >
            منصة متكاملة تتيح لك متابعة فرص الاستثمار في الثروة الحيوانية، ومراقبة
            مشروعاتك، والاطلاع على تفاصيل التشغيل والتكاليف والنتائج بكل شفافية.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <Link href="/opportunities" className="btn-gold group px-8 py-4 text-base">
              اكتشف فرص الاستثمار
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold"
            >
              <Play className="h-5 w-5" />
              كيف تعمل عزبة؟
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ivory/50 sm:mt-8 sm:gap-x-6"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold" />
              شفافية كاملة
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-gold" />
              إدارة محترفة
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-gold" />
              رعاية بيطرية
            </span>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="relative z-10 mt-auto pb-8"
        >
          <div className="container-page">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
                  className="group rounded-2xl border border-white/25 bg-white/[0.03] px-3 py-3 text-center backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.07] sm:px-6 sm:py-5"
                >
                  <stat.icon className="mx-auto mb-1.5 h-5 w-5 text-gold sm:mb-2 sm:h-6 sm:w-6" />
                  <div className="text-2xl font-bold text-white sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm font-semibold text-ivory/90">{stat.label}</div>
                  <div className="text-xs text-ivory/50">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 sm:block"
      >
        <div className="flex flex-col items-center gap-2 text-ivory/40">
          <span className="text-[10px] font-medium uppercase tracking-widest">اسحب للأسفل</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
