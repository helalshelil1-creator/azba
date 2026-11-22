import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { FileText, ShieldCheck, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'الشروط والأحكام', description: 'الشروط والأحكام الحاكمة لاستخدام منصة عزبة' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <FileText className="h-3.5 w-3.5" />وثيقة قانونية
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">الشروط والأحكام</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">باستخدامك منصة عزبة فأنت توافق على هذه الشروط. يُرجى قراءتها بعناية.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><FileText className="h-5 w-5 text-gold" />١. قبول الشروط</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>عند إنشاء حساب أو استخدام أي خدمة على المنصة، فأنت توافق على هذه الشروط والأحكام.</p><p>إذا لم توافق على أي بند، يُرجى التوقف عن استخدام المنصة.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />٢. أهلية المستثمر</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>يجب أن يكون عمرك ١٨ عامًا على الأقل.</p><p>يجب أن تستوفي متطلبات اعرف عميلك (KYC) قبل إتمام أي استثمار.</p><p>تُعد المعلومات التي تقدمها صحيحة وكاملة تحت مسؤوليتك القانونية.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><AlertTriangle className="h-5 w-5 text-gold" />٣. طبيعة الاستثمار</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الاستثمار في الثروة الحيوانية ينطوي على مخاطر تشغيلية وصحية وسوقية.</p><p>لا تضمن المنصة تحقيق أي عائد محدد، والعوائد المعروضة تقديرية.</p><p>قد تتعرض لخسارة جزء أو كل رأس مالك.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><FileText className="h-5 w-5 text-gold" />٤. التزاماتك</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الحفاظ على سرية بيانات دخولك وعدم مشاركتها.</p><p>عدم استخدام المنصة لأي غرض غير قانوني.</p><p>الالتزام بالحدود الاستثمارية المطبقة في نطاقك.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><FileText className="h-5 w-5 text-gold" />٥. إنهاء الحساب</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>يحق للمنصة تعليق أو إغلاق الحساب عند مخالفة الشروط.</p><p>يمكنك طلب إغلاق حسابك في أي وقت بعد تصفية استثماراتك.</p></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
