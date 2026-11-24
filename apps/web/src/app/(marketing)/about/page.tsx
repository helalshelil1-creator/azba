import React from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Reveal } from '@/components/marketing/reveal'
import { Info, Target, Eye, Users, ShieldCheck } from 'lucide-react'

export const metadata = { title: 'عن عزبة', description: 'تعرف على رؤية ورسالة منصة عزبة في الاستثمار الزراعي' }

export default function Page() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-16 text-white sm:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
              <Info className="h-3.5 w-3.5" />استثمر في الثروة الحقيقية
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">عن عزبة</h1>
            <p className="mt-3 max-w-2xl text-ivory/70">عزبة منصة مصرية رائدة تربط الاستثمار المنظم بالثروة الحيوانية والإدارة الزراعية والتكنولوجيا المالية.</p>
          </Reveal>
        </div>
      </section>
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Eye className="h-5 w-5 text-gold" />رؤيتنا</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>أن نكون المنصة الأولى عربيًا في الاستثمار الزراعي المنظم.</p><p>نسعى إلى توسيع نطاق عملنا من مصر إلى الأسواق العربية في المرحلة الثانية.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Target className="h-5 w-5 text-gold" />رسالتنا</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>تمكين المستثمرين الأفراد من المشاركة في مشاريع الثروة الحيوانية بحد أدنى مرن وشفافية كاملة.</p><p>إدارة كل مشروع بمعايير احترافية في التغذية والرعاية البيطرية والمحاسبة.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><Users className="h-5 w-5 text-gold" />قيمنا</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>الشفافية في كل رقم وتقرير.</p><p>الالتزام بمعايير الحوكمة والتوجّه المقصود حماية أموال المستثمرين في حسابات منفصلة (تصور وليس تشغيلًا فعليًا حاليًا).</p><p>الاستدامة في التشغيل والاحترام الكامل لصحة الحيوان.</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary"><ShieldCheck className="h-5 w-5 text-gold" />حوكمة الاستثمار</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80"><p>التصميم المقصود إيداع أموال المستثمرين في حسابات منفصلة عن حسابات التشغيل (تصور وليس تشغيلًا فعليًا حاليًا).</p><p>تُراجع كل مصروف من مسؤول مالي مستقل قبل الصرف.</p><p>تُرحّل جميع الحركات المالية بنظام القيد المزدوج.</p></div>
          </div>
        </div>
      </div>

      <section className="container-page pb-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="eyebrow">من المزارع</span>
          <h2 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">حيوانات حقيقية تُدار باحترافية</h2>
          <p className="mt-2 text-sm text-muted-foreground">لقطات من مشاريع الأبقار والجاموس والماعز والأغنام والخيل.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { src: '/images/cattle.jpg', label: 'أبقار حلابة' },
            { src: '/images/buffalo.jpg', label: 'جاموس' },
            { src: '/images/goat.jpg', label: 'ماعز' },
            { src: '/images/sheep.jpg', label: 'أغنام' },
          ].map((img) => (
            <figure key={img.src} className="group overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <Image src={img.src} alt={img.label} fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <figcaption className="px-4 py-3 text-center text-sm font-bold text-primary">{img.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <Footer />

    </div>
  )
}
