import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { Sparkles, UserPlus, Search, Wallet, TrendingUp } from 'lucide-react'
import { PageLogo } from '@/components/layout/page-logo'

export const metadata = { alternates: { canonical: '/how-it-works' }, title: 'كيف تعمل المنصة', description: 'خطوات الاستثمار في الثروة الحيوانية عبر منصة عزبة' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <PageLogo className="mb-6 mt-6" />
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <Sparkles className="h-3.5 w-3.5" />٤ خطوات بسيطة
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">كيف تعمل المنصة</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">من التسجيل إلى استلام العوائد — رحلتك الاستثمارية في الثروة الحقيقية تبدأ بأربع خطوات واضحة.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><UserPlus className="h-5 w-5 text-gold" />سجّل حسابك مجانًا</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>أنشئ حسابك خلال دقيقة واحدة باستخدام بريدك الإلكتروني ورقم هاتفك.</p><p>أكمل ملفك الاستثماري ووثّق هويتك لتفعيل حدود الاستثمار الأعلى.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Search className="h-5 w-5 text-gold" />اختر الفرصة المناسبة</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تصفح المشاريع الموثّقة بالبيانات والتقارير البيطرية.</p><p>قارن العوائد المتوقعة ومستويات المخاطر ومدة التشغيل.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Wallet className="h-5 w-5 text-gold" />استثمر بأسهم مرنة</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>ابدأ بحصة واحدة أو أكثر حسب سعر السهم المعروض.</p><p>ادفع عبر محفظتك أو التحويل البنكي، واحصل على عقدك الإلكتروني فورًا.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><TrendingUp className="h-5 w-5 text-gold" />تابع واستلم عوائدك</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تابع أداء مشروعك والتقارير البيطرية والتحديثات الدورية.</p><p>استلم توزيعات الأرباح في محفظتك النقدية مع كل دورة توزيع.</p></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
