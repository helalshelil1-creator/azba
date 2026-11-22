'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircleQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'ما هو الحد الأدنى للاستثمار؟',
    a: 'يختلف الحد الأدنى بحسب المشروع. عادةً يبدأ من سهم واحد، وقد يكون سعر السهم بين ٣٠٠ و٦٠٠ جنيه مصري في مشاريع التسمين والألبان. سنوضح لك الحد الأدنى والأقصى لكل مشروع قبل الاستثمار.',
  },
  {
    q: 'كيف أستلم أرباحي؟',
    a: 'عند بيع الحيوانات واعتماد الحسابات النهائية للمشروع، يُحسب صافي النتيجة وتُوزع حصة المستثمرين بنسبة مساهمتهم. تُضاف الأرباح إلى محفظتك ويمكن سحبها أو إعادة استثمارها.',
  },
  {
    q: 'هل يمكنني الخروج قبل نهاية المشروع؟',
    a: 'سيتم توضيح شروط الخروج في عقد كل مشروع. الأسهم الأصلية غير قابلة للاسترداد المبكر عمومًا، لكن قد تُتيح المنصة سوقًا ثانويًا لتداول الأسهم بين المستثمرين مستقبلًا بعد استكمال المتطلبات التنظيمية.',
  },
  {
    q: 'أين تُحفظ أموالي؟',
    a: 'تُحفظ أموال المستثمرين في حسابات منفصلة عن أموال الشركة، وفق الهيكل القانوني المعتمد. لا تُستخدم أموالك في أي غرض آخر.',
  },
  {
    q: 'ما هي التراخيص اللازمة للمنصة؟',
    a: 'قبل استقبال أموال حقيقية، نعمل على استكمال المتطلبات القانونية والتنظيمية في مصر، بما في ذلك طبيعة الملكية المشتركة، وتراخيص الأنشطة المالية إن انطبقت، وحماية البيانات. حاليًا تعمل المنصة في وضع تجريبي (Sandbox).',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="section-padding bg-ivory">
      <div className="container-narrow">
        <div className="text-center">
          <span className="eyebrow">الأسئلة الشائعة</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            إجابات واضحة <span className="text-gradient-gold">قبل أن تستثمر</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-300',
                  isOpen ? 'border-gold/50 bg-white shadow-lg shadow-gold/5' : 'border-border/60 bg-white/60'
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                >
                  <span className="flex items-center gap-3 font-semibold text-primary">
                    <MessageCircleQuestion className={cn('h-5 w-5 shrink-0', isOpen ? 'text-gold-600' : 'text-primary/40')} />
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn('h-5 w-5 shrink-0 text-primary/40 transition-transform duration-300', isOpen && 'rotate-180 text-gold-600')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="border-t border-border/60 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
