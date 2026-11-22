'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Eye, FileText, Scale, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  {
    icon: Eye,
    title: 'تقارير دورية',
    desc: 'تقارير أداء منتظمة للمستثمرين تتضمن الأوزان، التكاليف، الحالة الصحية، والتدفقات النقدية.',
  },
  {
    icon: FileText,
    title: 'وثائق وعقود',
    desc: 'عقود استثمار موثقة، مستندات شراء وبيع، فواتير، وإيصالات — متاحة للتحميل بصيغة PDF.',
  },
  {
    icon: Scale,
    title: 'محاسبة مزدوجة',
    desc: 'دفتر أستاذ مزدوج لكل حركة مالية، مع قيود معتمدة لا تُحذف بل تُعكس وتُصحح بمستند.',
  },
  {
    icon: AlertTriangle,
    title: 'إفصاح المخاطر',
    desc: 'كل مشروع يعرض سجل المخاطر الخاص به: أمراض، أسعار، نفوق، سيولة — مع خطط التخفيف.',
  },
]

export function Transparency() {
  return (
    <section id="transparency" className="section-padding relative overflow-hidden bg-white">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">الشفافية وإدارة المخاطر</span>
            <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
              نؤمن أن <span className="text-gradient-gold">الثقة</span> تُبنى بالبيانات
            </h2>
            <p className="mt-4 text-muted-foreground">
              لا أرباح مضمونة، ولا وعود غير موثقة. ما نقدمه هو وضوح كامل في الأرقام
              والمستندات والمخاطر — لتتخذ قرارك عن بينة.
            </p>
            <div className="mt-8 space-y-4">
              {ITEMS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-ivory/60 p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-ivory">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="/images/livestock.jpg"
                alt="شفافية البيانات"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-[10px] text-ivory/70">توثيق العمليات</div>
                </div>
                <div className="glass-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-[10px] text-ivory/70">قيود محذوفة</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Transparency
