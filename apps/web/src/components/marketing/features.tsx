'use client'

import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, Stethoscope, Briefcase, Eye, Lock, BarChart3, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Eye,
    title: 'شفافية كاملة',
    desc: 'كل عملية شراء، وتكلفة، وبيع، وتوزيع مسجلة في دفتر الأستاذ المزدوج ويمكن الاطلاع عليها في أي وقت.',
    color: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'عوائد مستدامة',
    desc: 'نماذج استثمارية مبنية على دورات الإنتاج الحيواني الفعلية، مع تنويع المخاطر عبر مشاريع متعددة.',
    color: 'from-amber-500/15 to-amber-500/5 text-amber-600',
  },
  {
    icon: Stethoscope,
    title: 'رعاية بيطرية',
    desc: 'تقارير بيطرية معتمدة من أطباء بيطريين مرخصين، مع سجل صحي رقمي لكل حيوان يمكن تتبعه عبر QR.',
    color: 'from-sky-500/15 to-sky-500/5 text-sky-600',
  },
  {
    icon: Briefcase,
    title: 'إدارة محترفة',
    desc: 'فرق تشغيل وإدارة مزارع ومالية ومشتريات ومبيعات تعمل بمنهجية مؤسسية ومساءلة واضحة.',
    color: 'from-violet-500/15 to-violet-500/5 text-violet-600',
  },
  {
    icon: Lock,
    title: 'أمان وحماية',
    desc: 'فصل أموال الشركة عن أموال المستثمرين، وسجل تدقيق كامل، وصلاحيات متعددة المستويات.',
    color: 'from-rose-500/15 to-rose-500/5 text-rose-600',
  },
  {
    icon: BarChart3,
    title: 'تحليلات ذكية',
    desc: 'لوحات مؤشرات، تحليل اتجاهات الأوزان وتكاليف الأعلاف، وكشف الشذوذ في المصروفات — مدعومة ببيانات فعلية.',
    color: 'from-teal-500/15 to-teal-500/5 text-teal-600',
  },
]

export function Features() {
  return (
    <section className="section-padding relative overflow-hidden bg-primary-950 text-ivory">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow border-gold/40 bg-gold/10 text-gold">لماذا عزبة؟</span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            منصة صُممت على معايير <span className="text-gradient-gold">مؤسسية</span>
          </h2>
          <p className="mt-4 text-ivory/60">
            نطبق الحوكمة والشفافية التي اعتدتها في الأسواق المالية على قطاع الثروة الحيوانية.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.06]"
            >
              <div
                className={cn(
                  'mb-5 inline-flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br p-3 transition-transform duration-300 group-hover:scale-110',
                  f.color
                )}
                style={{ height: 52, width: 52 }}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-white/10 pt-10">
          {['تقارير مالية موثقة', 'سجل تدقيق كامل', 'صلاحيات RBAC', 'تشفير وحماية'].map((t) => (
            <span key={t} className="inline-flex items-center gap-2 text-sm text-ivory/50">
              <FileCheck className="h-4 w-4 text-gold" />
              {t}
            </span>
          ))}
        </div>
      </div>
    
        <div className="mt-14 grid grid-cols-2 gap-4 opacity-90 lg:grid-cols-3">
          {[
            { src: '/images/dairy.jpg', label: 'أبقار ألبان' },
            { src: '/images/hay.jpg', label: 'علف وتغذية' },
            { src: '/images/beef.jpg', label: 'عجول تسمين' },
          ].map((img) => (
            <div key={img.src} className="relative h-40 overflow-hidden rounded-2xl lg:h-52">
              <Image src={img.src} alt={img.label} fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 to-transparent" />
              <span className="absolute bottom-3 right-3 text-sm font-bold text-white">{img.label}</span>
            </div>
          ))}
        </div>
</section>
  )
}

export default Features
