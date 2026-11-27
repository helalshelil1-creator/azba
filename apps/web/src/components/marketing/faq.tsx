'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircleQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang, tx } from '@/lib/lang-store'

const FAQS = [
  {
    q: 'ما هو الحد الأدنى للاستثمار؟',
    qEn: 'What is the minimum investment?',
    a: 'يختلف الحد الأدنى بحسب المشروع. عادةً يبدأ من سهم واحد، وقد يكون سعر السهم بين ٣٠٠ و٦٠٠ جنيه مصري في مشاريع التسمين والألبان. سنوضح لك الحد الأدنى والأقصى لكل مشروع قبل الاستثمار.',
    aEn: 'The minimum varies by project. It usually starts from a single share, with a share price typically between 300 and 600 EGP in fattening and dairy projects. We show you the minimum and maximum for each project before you invest.',
  },
  {
    q: 'كيف أستلم أرباحي؟',
    qEn: 'How do I receive my profits?',
    a: 'عند بيع الحيوانات واعتماد الحسابات النهائية للمشروع، يُحسب صافي النتيجة وتُوزع حصة المستثمرين بنسبة مساهمتهم. تُضاف الأرباح إلى محفظتك ويمكن سحبها أو إعادة استثمارها.',
    aEn: 'When the animals are sold and the project’s final accounts are approved, the net result is calculated and investors’ shares are distributed in proportion to their contributions. Profits are added to your wallet and can be withdrawn or reinvested.',
  },
  {
    q: 'هل يمكنني الخروج قبل نهاية المشروع؟',
    qEn: 'Can I exit before the project ends?',
    a: 'سيتم توضيح شروط الخروج في عقد كل مشروع. الأسهم الأصلية غير قابلة للاسترداد المبكر عمومًا، لكن قد تُتيح المنصة سوقًا ثانويًا لتداول الأسهم بين المستثمرين مستقبلًا بعد استكمال المتطلبات التنظيمية.',
    aEn: 'Exit terms are stated in each project’s contract. Original shares are generally not redeemable early, but the platform may offer a secondary market for trading shares between investors in the future once regulatory requirements are complete.',
  },
  {
    q: 'أين تُحفظ أموالي؟',
    qEn: 'Where is my money kept?',
    a: 'التصميم المقصود هو حفظ أموال المستثمرين في حسابات منفصلة عن أموال الشركة. هذا تصور للمنصة وليس تشغيلًا فعليًا حاليًا، ولا تستقبل هذه النسخة أي أموال.',
    aEn: 'The intended design keeps investor funds in accounts separate from company funds. This is a platform concept, not live operations yet, and this version does not accept any money.',
  },
  {
    q: 'ما هي التراخيص اللازمة للمنصة؟',
    qEn: 'What licenses does the platform need?',
    a: 'قبل استقبال أموال حقيقية، نعمل على استكمال المتطلبات القانونية والتنظيمية في مصر، بما في ذلك طبيعة الملكية المشتركة، وتراخيص الأنشطة المالية إن انطبقت، وحماية البيانات. حاليًا تعمل المنصة في وضع تجريبي (Sandbox).',
    aEn: 'Before accepting real money, we are completing the legal and regulatory requirements in Egypt, including the nature of joint ownership, financial-activity licenses where applicable, and data protection. The platform currently runs in sandbox mode.',
  },
]

export function FAQ() {
  const { lang } = useLang()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="section-padding bg-ivory">
      <div className="container-narrow">
        <div className="text-center">
          <span className="eyebrow">{tx(lang, 'الأسئلة الشائعة', 'Frequently asked questions')}</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            {lang === 'ar' ? (
              <>إجابات واضحة <span className="text-gradient-gold">قبل أن تستثمر</span></>
            ) : (
              <>Clear answers <span className="text-gradient-gold">before you invest</span></>
            )}
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
                    {lang === 'ar' ? item.q : item.qEn}
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
                        {lang === 'ar' ? item.a : item.aEn}
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
