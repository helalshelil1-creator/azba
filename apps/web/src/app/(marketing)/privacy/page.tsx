import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { ShieldCheck, Database, Lock } from 'lucide-react'

export const metadata = { alternates: { canonical: '/privacy' }, title: 'سياسة الخصوصية', description: 'كيف نجمع ونستخدم ونحمي بياناتك الشخصية' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <ShieldCheck className="h-3.5 w-3.5" />بياناتك محمية
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">سياسة الخصوصية</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">نلتزم بحماية بياناتك الشخصية وعدم مشاركتها مع أطراف ثالثة إلا لمتطلبات التشغيل والقانون.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Database className="h-5 w-5 text-gold" />البيانات التي نجمعها</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>بيانات الحساب: الاسم، البريد، الهاتف، كلمة المرور بعد تجزئتها (hash) وليس نصها.</p><p>بيانات الاستثمار: العقود، الأسهم، المدفوعات، العوائد.</p><p>بيانات الاستخدام: سجل الدخول، الجهاز، عنوان IP.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Lock className="h-5 w-5 text-gold" />حماية البيانات</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تشفير كلمات المرور بتقنية bcrypt.</p><p>تشفير الاتصالات عبر TLS.</p><p>تخزين البيانات في قواعد بيانات محمية ومقيد الوصول إليها.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />مشاركة البيانات</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>لا نبيع بياناتك لأي طرف ثالث.</p><p>نشارك البيانات فقط مع مقدمي الخدمات المطلوبين للتشغيل.</p><p>قد نفصحح عن البيانات للسلطات المختصة عند الطلب القانوني.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />حقوقك</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>طلب الوصول إلى بياناتك أو تصحيحها في أي وقت.</p><p>طلب حذف حسابك وبياناتك وفقًا للسياسات المطبقة.</p><p>إيقاف تلقي الرسائل التسويقية من إعدادات حسابك.</p></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
