import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export const metadata = { alternates: { canonical: '/disclosures' }, title: 'إفصاح المخاطر', description: 'إفصاح كامل عن المخاطر المرتبطة بالاستثمار في الثروة الحيوانية' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <AlertTriangle className="h-3.5 w-3.5" />اقرأ قبل الاستثمار
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">إفصاح المخاطر</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">الاستثمار في الثروة الحيوانية ليس وديعة ولا سندًا مضمونًا. هذا الإفصاح يوضح المخاطر بصدق.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><AlertTriangle className="h-5 w-5 text-gold" />المخاطر التشغيلية</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>أمراض القطيع والأوبئة قد تؤثر على الإنتاجية أو تؤدي إلى خسائر.</p><p>مخاطر التغذية والأسعار العالمية للأعلاف.</p><p>مخاطر إدارة المزرعة والكوادر.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><AlertTriangle className="h-5 w-5 text-gold" />المخاطر السوقية</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تقلب أسعار بيع اللحوم والألبان والجاموس.</p><p>تغير أنماط الطلب الموسمية.</p><p>المنافسة من المستوردين والمنتجين الكبار.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><AlertTriangle className="h-5 w-5 text-gold" />المخاطر المالية</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>قد تتأخر توزيعات الأرباح أو تقل عن التقديرات.</p><p>قد لا تتمكن من بيع حصتك بسرعة (عدم السيولة).</p><p>مخاطر سعر الصرف في حالة الاستثمارات بالعملات الأجنبية.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />إجراءات التخفيف</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تنويع المحفظة عبر مشاريع متعددة بدلًا من مشروع واحد.</p><p>التأمين على القطيع في المشاريع المؤمَّنة.</p><p>مراجعة دورية للتقارير المالية والبيطرية قبل الاستثمار.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />إقرار</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>بالإقدام على الاستثمار، فأنت تقر بأنك قرأت هذا الإفصاح وفهمت المخاطر المحتملة.</p><p>أنت تقر بأن العوائد السابقة أو التقديرية لا تضمن العوائد المستقبلية.</p></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
