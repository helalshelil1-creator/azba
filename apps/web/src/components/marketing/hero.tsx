'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from './framer'
import {
  ArrowLeft,
  ShieldCheck,
  Play,
  ChevronDown,
  Leaf,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const HERO_IMAGES = [
  { src: '/images/cattle.jpg', alt: 'بقرة' },
  { src: '/images/horse.jpg', alt: 'حصان' },
  { src: '/images/sheep.jpg', alt: 'أغنام وخرفان' },
  { src: '/images/goat.jpg', alt: 'ماعز' },
  { src: '/images/buffalo.jpg', alt: 'جاموس' },
]

/** مدة عرض كل صورة بالملي ثانية */
const HERO_INTERVAL = 3000

export function HeroSection() {
  const [index, setIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const count = HERO_IMAGES.length

  useEffect(() => {
    if (prefersReducedMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), HERO_INTERVAL)
    return () => clearInterval(id)
  }, [prefersReducedMotion, count])

  return (
    <section className="relative w-full overflow-hidden bg-primary-950 min-h-[108svh]">
      {/* خلفية متحركة: خمس صور تتبدل كل ٣ ثواني */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
              i === index ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-primary-950/40 to-primary-950/90" />
      <div className="absolute inset-0 bg-gradient-to-l from-primary-950/60 via-transparent to-primary-950/30" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[108svh] flex-col">
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
              className="mx-auto h-28 w-auto sm:h-40"
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-gold" />
              شفافية كاملة
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <BadgeCheck className="h-4 w-4 text-gold" />
              إدارة محترفة
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <Leaf className="h-4 w-4 text-gold" />
              رعاية بيطرية
            </span>
          </motion.div>
        </div>

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
