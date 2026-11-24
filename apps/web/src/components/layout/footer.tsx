'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@azba/ui/logo'
import { CONTACT } from '@/lib/contact'
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, ArrowUp,
  ShieldCheck, Scale, AlertTriangle, Globe,
} from 'lucide-react'

const COLUMNS = [
  {
    title: 'المنصة',
    links: [
      { href: '/', label: 'الرئيسية' },
      { href: '/invest', label: 'فرص الاستثمار' },
      { href: '/how-it-works', label: 'كيف نعمل؟' },
      { href: '/farms', label: 'المزارع' },
      { href: '/about', label: 'من نحن' },
    ],
  },
  {
    title: 'المستثمرين',
    links: [
      { href: '/register', label: 'إنشاء حساب' },
      { href: '/login', label: 'تسجيل الدخول' },
      { href: '/dashboard/portfolio', label: 'محفظتي' },
      { href: '/dashboard/invest', label: 'محاكي الاستثمار' },
      { href: '/#faq', label: 'الأسئلة الشائعة' },
    ],
  },
  {
    title: 'شفافية وامتثال',
    links: [
      { href: '/#transparency', label: 'الشفافية والتقارير' },
      { href: '/disclosures', label: 'إدارة المخاطر' },
      { href: '/disclosures', label: 'إفصاحات الاستثمار' },
      { href: '/terms', label: 'الشروط والأحكام' },
      { href: '/privacy', label: 'سياسة الخصوصية' },
    ],
  },
  {
    title: 'تواصل',
    links: [
      { href: '/contact', label: 'اتصل بنا' },
      { href: '/dashboard/support', label: 'الدعم الفني' },
      { href: '/contact', label: 'وظائف' },
      { href: '/contact', label: 'صحافة' },
    ],
  },
]

const SOCIAL = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer className="border-t border-white/10 bg-primary-950 pb-24 text-ivory lg:pb-0">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-12 lg:flex-row">
          <div>
            <h3 className="text-2xl font-bold text-white">اشترك في نشرة عزبة</h3>
            <p className="mt-1 text-sm text-ivory/60">
              آخر تحديثات العرض الشخصي للمنصة.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-ivory/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <button type="submit" className="btn-gold px-6 py-3 text-sm">
              اشترك
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo size={48} variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
            نموذج شخصي غير تجاري لمنصة تعرض مشاريع الثروة الحيوانية. المشاريع والأرقام للعرض فقط.
          </p>
          <div className="mt-6 space-y-2 text-sm text-ivory/60">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-gold" />
              <span dir="ltr">{CONTACT.phoneDisplay}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-gold" />
              <span>بريد توضيحي للعرض فقط</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-gold" />
              <span>القاهرة، مصر</span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-all hover:border-gold hover:text-gold"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Legal strip */}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-ivory/40 lg:flex-row">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              الأرقام المعروضة للعرض فقط
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-gold" />
              الاستثمار في الثروة الحيوانية ينطوي على مخاطر
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} AZBA | عزبة — جميع الحقوق محفوظة</span>
            <button
              onClick={scrollTop}
              aria-label="Back to top"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ivory/60 transition-all hover:border-gold hover:text-gold"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
