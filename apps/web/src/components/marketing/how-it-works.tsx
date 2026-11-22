'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Wallet, TrendingUp, FileCheck, ShieldCheck, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    num: '٠١',
    title: 'اكتشف الفرص',
    desc: 'تصفح مشاريع الثروة الحيوانية الموثقة بعناية، وقارن بينها حسب العائد والمدة والمخاطر.',
    icon: Search,
  },
  {
    num: '٠٢',
    title: 'حلّل وقارن',
    desc: 'استخدم المحاكاة الذكية لفهم السيناريوهات المختلفة وتأثير أسعار الأعلاف والبيع على النتائج.',
    icon: FileCheck,
  },
  {
    num: '٠٣',
    title: 'استثمر بأمان',
    desc: 'احجز أسهمك، راجع العقد، وأكّد الدفع عبر قنوات معتمدة. أموالك محفوظة في حساب منفصل.',
    icon: ShieldCheck,
  },
  {
    num: '٠٤',
    title: 'تابع محفظتك',
    desc: 'راقب أداء حيواناتك وأوزانها والتكاليف والتقارير البيطرية لحظة بلحظة عبر لوحة التحكم.',
    icon: TrendingUp,
  },
]

export function HowItWorks() {
  return (
    <section className="section-padding relative overflow-hidden bg-ivory">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">كيف تعمل عزبة؟</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            رحلة استثمارك في <span className="text-gradient-gold">أربع خطوات</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            من أول نظرة على الفرصة حتى استلام العائد — كل خطوة موثقة وشفافة.
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
                <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute -left-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-l from-gold/40 to-transparent lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/how-it-works" className="btn-outline group">
            التفاصيل الكاملة
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
