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

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer className="border-t border-white/10 bg-primary-950 pb-24 text-ivory lg:pb-0">
      {/* Main footer */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo size={48} variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
            نموذج شخصي غير تجاري لمنصة تعرض مشاريع الثروة الحيوانية. المشاريع والأرقام للعرض فقط.
          </p>
          <div className="mt-6 space-y-2 text-sm text-ivory/60">
            <p>بيانات التواصل توضيحية وغير فعّالة في هذا العرض الشخصي.</p>
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
