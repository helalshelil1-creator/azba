'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@azba/ui/logo'
import { CONTACT } from '@/lib/contact'
import { useLang, tx } from '@/lib/lang-store'
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, ArrowUp,
  ShieldCheck, Scale, AlertTriangle, Globe,
} from 'lucide-react'

const COLUMNS = [
  {
    title: 'المنصة',
    titleEn: 'Platform',
    links: [
      { href: '/', label: 'الرئيسية', labelEn: 'Home' },
      { href: '/invest', label: 'فرص الاستثمار', labelEn: 'Invest' },
      { href: '/how-it-works', label: 'كيف نعمل؟', labelEn: 'How it works' },
      { href: '/farms', label: 'المزارع', labelEn: 'Farms' },
      { href: '/about', label: 'من نحن', labelEn: 'About us' },
    ],
  },
  {
    title: 'المستثمرين',
    titleEn: 'Investors',
    links: [
      { href: '/register', label: 'إنشاء حساب', labelEn: 'Create account' },
      { href: '/login', label: 'تسجيل الدخول', labelEn: 'Sign in' },
      { href: '/dashboard/portfolio', label: 'محفظتي', labelEn: 'My portfolio' },
      { href: '/dashboard/invest', label: 'محاكي الاستثمار', labelEn: 'Investment simulator' },
      { href: '/#faq', label: 'الأسئلة الشائعة', labelEn: 'FAQ' },
    ],
  },
  {
    title: 'شفافية وامتثال',
    titleEn: 'Transparency',
    links: [
      { href: '/#transparency', label: 'الشفافية والتقارير', labelEn: 'Transparency & reports' },
      { href: '/disclosures', label: 'إدارة المخاطر', labelEn: 'Risk management' },
      { href: '/disclosures', label: 'إفصاحات الاستثمار', labelEn: 'Investment disclosures' },
      { href: '/terms', label: 'الشروط والأحكام', labelEn: 'Terms' },
      { href: '/privacy', label: 'سياسة الخصوصية', labelEn: 'Privacy policy' },
    ],
  },
  {
    title: 'تواصل',
    titleEn: 'Contact',
    links: [
      { href: '/contact', label: 'اتصل بنا', labelEn: 'Contact us' },
      { href: '/dashboard/support', label: 'الدعم الفني', labelEn: 'Support' },
      { href: '/contact', label: 'وظائف', labelEn: 'Careers' },
      { href: '/contact', label: 'صحافة', labelEn: 'Press' },
    ],
  },
]

export function Footer() {
  const { lang } = useLang()
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer className="border-t border-white/10 bg-primary-950 pb-24 text-ivory lg:pb-0">
      {/* Main footer */}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo size={48} variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
            {tx(lang, 'منصة مصرية للاستثمار المنظم في الثروة الحيوانية — من المزرعة إلى محفظتك الاستثمارية، بشفافية مؤسسية وإدارة محترفة.', 'An Egyptian platform for organized livestock investment, from the farm to your portfolio, with institutional transparency and professional management.')}
          </p>
          <div className="mt-6 space-y-2 text-sm text-ivory/60">
            <p>{tx(lang, 'بيانات التواصل توضيحية وغير فعّالة.', 'Contact details are illustrative and not active.')}</p>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">{lang === 'ar' ? col.title : col.titleEn}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-gold"
                  >
                    {lang === 'ar' ? link.label : link.labelEn}
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
              {tx(lang, 'الأرقام المعروضة للعرض فقط', 'Figures shown are for display only')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-gold" />
              {tx(lang, 'الاستثمار في الثروة الحيوانية ينطوي على مخاطر', 'Livestock investment involves risk')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} AZBA | عزبة — {tx(lang, 'جميع الحقوق محفوظة', 'All rights reserved')}</span>
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
