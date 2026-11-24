'use client'

import Image from 'next/image'
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

const HERO_IMAGES: { src: string; alt: string; wideOnMobile?: boolean }[] = [
  { src: '/images/cattle.jpg', alt: 'بقرة' },
  { src: '/images/gallery/buffalo-feeding.jpg', alt: 'جاموس عند المعلف في حظيرة مفتوحة وقت الغروب', wideOnMobile: true },
  { src: '/images/horse.jpg', alt: 'حصان' },
  { src: '/images/sheep.jpg', alt: 'أغنام وخرفان' },
  { src: '/images/goat.jpg', alt: 'ماعز' },
  { src: '/images/buffalo.jpg', alt: 'جاموس' },
]

/** مدة عرض كل صورة بالملي ثانية */
const HERO_INTERVAL = 5000

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
    <section className="relative w-full overflow-hidden bg-primary-950 min-h-svh">
      {/* خلفية متحركة: خمس صور تتبدل كل ٥ ثواني */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img.src}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              i === index ? 'opacity-100' : 'opacity-0'
            )}
          >
            {img.wideOnMobile && (
              <Image
                src={img.src}
                alt=""
                fill
                sizes="100vw"
                className="scale-110 object-cover object-center blur-2xl sm:hidden"
              />
            )}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              className={cn(
                'object-center',
                img.wideOnMobile ? 'object-contain sm:object-cover' : 'object-cover'
              )}
            />
          </div>
        ))}
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-primary-950/40 to-primary-950/90" />
      <div className="absolute inset-0 bg-gradient-to-l from-primary-950/60 via-transparent to-primary-950/30" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-svh flex-col">
        <div className="container-page flex flex-1 flex-col items-center justify-center pt-12 text-center sm:pt-16 lg:pt-24">

          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mb-6 sm:mb-8"
          >
            {/* هالة داكنة خلف الشعار لضمان وضوحه فوق الصورة */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-950/75 blur-3xl sm:h-64 sm:w-64"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="AZBA | عزبة"
              width={612}
              height={408}
              draggable={false}
              className="relative mx-auto h-36 w-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] sm:h-52 lg:h-60"
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
            <Link href="/invest" className="btn-gold group px-8 py-4 text-base">
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
