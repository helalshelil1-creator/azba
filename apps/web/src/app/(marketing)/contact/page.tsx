import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { CONTACT } from '@/lib/contact'
import { PageLogo } from '@/components/layout/page-logo'

export const metadata = { alternates: { canonical: '/contact' }, title: 'اتصل بنا', description: 'فريق الدعم جاهز للإجابة على استفساراتك' }

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
              <Mail className="h-3.5 w-3.5" />صفحة توضيحية
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">اتصل بنا</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">هذه صفحة توضيحية.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Mail className="h-5 w-5 text-gold" />ملاحظة</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>بيانات التواصل هنا توضيحية وغير فعّالة، ولا توجد قناة تواصل فعّالة مقدّمة ضمن هذا العرض.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Phone className="h-5 w-5 text-gold" />التواصل (غير فعّال)</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
              <p className="text-muted-foreground">لا توجد بيانات تواصل فعّالة مقدّمة ضمن هذا العرض.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
