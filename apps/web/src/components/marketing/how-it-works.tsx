'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Wallet, TrendingUp, FileCheck, ShieldCheck, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang, tx } from '@/lib/lang-store'

const STEPS = [
  {
    num: '٠١',
    title: 'اكتشف الفرص',
    titleEn: 'Discover opportunities',
    desc: 'تصفح مشاريع الثروة الحيوانية الموثقة بعناية، وقارن بينها حسب العائد والمدة والمخاطر.',
    descEn: 'Browse carefully vetted livestock projects and compare them by return, duration, and risk.',
    icon: Search,
  },
  {
    num: '٠٢',
    title: 'حلّل وقارن',
    titleEn: 'Analyze and compare',
    desc: 'استخدم المحاكاة الذكية لفهم السيناريوهات المختلفة وتأثير أسعار الأعلاف والبيع على النتائج.',
    descEn: 'Use the smart simulator to understand different scenarios and the effect of feed and sale prices on results.',
    icon: FileCheck,
  },
  {
    num: '٠٣',
    title: 'استثمر بأمان',
    titleEn: 'Invest safely',
    desc: 'احجز أسهمك، راجع العقد، وأكّد الدفع. التصميم المقصود حفظ الأموال في حساب منفصل، وهذه النسخة لا تستقبل أموالًا فعلية.',
    descEn: 'Reserve your shares, review the contract, and confirm payment. The intended design keeps funds in a separate account; this version does not accept real money.',
    icon: ShieldCheck,
  },
  {
    num: '٠٤',
    title: 'تابع محفظتك',
    titleEn: 'Track your portfolio',
    desc: 'راقب أداء حيواناتك وأوزانها والتكاليف والتقارير البيطرية لحظة بلحظة عبر لوحة التحكم.',
    descEn: 'Monitor your animals’ performance, weights, costs, and veterinary reports in real time from the dashboard.',
    icon: TrendingUp,
  },
]

export function HowItWorks() {
  const { lang } = useLang()
  return (
    <section className="section-padding relative overflow-hidden bg-ivory">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{tx(lang, 'كيف تعمل عزبة؟', 'How does AZBA work?')}</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            {lang === 'ar' ? (
              <>رحلة استثمارك في <span className="text-gradient-gold">أربع خطوات</span></>
            ) : (
              <>Your investment journey in <span className="text-gradient-gold">four steps</span></>
            )}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {tx(lang, 'من أول نظرة على الفرصة حتى استلام العائد — كل خطوة موثقة وشفافة.', 'From your first look at an opportunity to receiving your return, every step is documented and transparent.')}
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative"
            >
              <div className="card-hover h-full">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors duration-300 group-hover:bg-gold/15 group-hover:text-gold-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute left-6 top-6 font-heading text-5xl font-bold text-primary/10">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-primary">{lang === 'ar' ? step.title : step.titleEn}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lang === 'ar' ? step.desc : step.descEn}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute -left-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-l from-gold/40 to-transparent lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/how-it-works" className="btn-outline group">
            {tx(lang, 'التفاصيل الكاملة', 'Full details')}
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
