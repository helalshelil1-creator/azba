'use client'

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'
import { useLang, tx } from '@/lib/lang-store'

export function CTA() {
  const { lang } = useLang()
  return (
    <section className="relative overflow-hidden bg-primary-950 py-16 text-ivory sm:py-24">
      <Image src="/images/horse.jpg" alt="" aria-hidden="true" fill sizes="100vw" className="object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/80 to-primary-950/60" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="container-narrow relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-sm font-semibold text-gold">
            <Sparkles className="h-4 w-4" />
            {tx(lang, 'ابدأ رحلتك الاستثمارية', 'Start your investment journey')}
          </span>
          <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {lang === 'ar' ? (
              <>استثمر في <span className="text-gradient-gold">الثروة الحقيقية</span> اليوم</>
            ) : (
              <>Invest in <span className="text-gradient-gold">real wealth</span> today</>
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ivory/60">
            {tx(lang, 'انضم إلى مجتمع المستثمرين الذين يضعون أموالهم في أصول حقيقية ملموسة، بشفافية مؤسسية وإدارة محترفة.', 'Join a community of investors who put their money into tangible real assets, with institutional transparency and professional management.')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="btn-gold group px-8 py-4 text-base">
              <TrendingUp className="h-5 w-5" />
              {tx(lang, 'إنشاء حساب مجاني', 'Create a free account')}
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-8 py-4 text-base font-semibold text-white transition-all hover:border-gold hover:text-gold"
            >
              {tx(lang, 'تصفح الفرص أولًا', 'Browse opportunities first')}
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ivory/40">
            <ShieldCheck className="h-4 w-4 text-gold" />
            {tx(lang, 'لا التزام — استكشف قبل أن تقرر', 'No commitment, explore before you decide')}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
