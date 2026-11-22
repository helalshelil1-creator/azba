import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata = { title: 'اتصل بنا', description: 'فريق الدعم جاهز للإجابة على استفساراتك' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <Mail className="h-3.5 w-3.5" />نرد خلال ٢٤ ساعة
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">اتصل بنا</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">سواء كان لديك سؤال عن الاستثمار أو تحتاج مساعدة تقنية، فريقنا هنا لمساعدتك.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Mail className="h-5 w-5 text-gold" />البريد الإلكتروني</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الدعم العام: support@azba.com</p><p>الاستفسارات الاستثمارية: invest@azba.com</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Phone className="h-5 w-5 text-gold" />الهاتف</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الخط الساخن: 19XXX (من داخل مصر)</p><p>من الخارج: +20 10 XXXX XXXX</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><MapPin className="h-5 w-5 text-gold" />المقر</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>القاهرة — مصر</p><p>يعمل فريق التشغيل في المزارع الشريكة بمحافظات متعددة.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Clock className="h-5 w-5 text-gold" />ساعات العمل</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الأحد إلى الخميس: ٩ صباحًا — ٦ مساءً</p><p>خدمة المستثمرين عبر المنصة: على مدار الساعة</p></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
