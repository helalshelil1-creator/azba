'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, TrendingUp, ChevronLeft, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { CONTACT } from '@/lib/contact'
import { cn } from '@/lib/utils'

const MENU_ITEMS = [
  { href: '/', label: 'الرئيسية', labelEn: 'Home' },
  { href: '/opportunities', label: 'فرص الاستثمار', labelEn: 'Investment Opportunities' },
  { href: '/dashboard/portfolio', label: 'محفظتي', labelEn: 'My Portfolio' },
  { href: '/farms', label: 'المزارع', labelEn: 'Farms' },
  { href: '/how-it-works', label: 'كيف تعمل عزبة؟', labelEn: 'How AZBA Works' },
  { href: '/about', label: 'من نحن', labelEn: 'About Us' },
  { href: '/contact', label: 'تواصل معنا', labelEn: 'Contact Us' },
]

export function MobileMenu({
  open,
  onClose,
  lang,
  onLangChange,
}: {
  open: boolean
  onClose: () => void
  lang: 'ar' | 'en'
  onLangChange: (l: 'ar' | 'en') => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] transition-opacity duration-500 ease-menu',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary-950/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col transition-transform duration-700 ease-menu',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Logo size={40} variant="light" lang={lang} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLangChange(lang === 'ar' ? 'en' : 'ar')}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-ivory/80 hover:bg-white/10 transition-colors"
            >
              <Globe className="h-4 w-4" />
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-ivory hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item, i) => (
              <li
                key={item.href}
                className={cn(
                  'transition-all duration-700 ease-menu',
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                )}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center justify-between border-b border-white/5 py-4 text-lg font-medium text-ivory/90 transition-colors hover:text-gold',
                    pathname === item.href && 'text-gold'
                  )}
                >
                  <span>{lang === 'ar' ? item.label : item.labelEn}</span>
                  <ChevronLeft className="h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-gold" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact info */}
          <div className="mt-10 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">تواصل معنا</p>
            <div className="flex items-center gap-3 text-sm text-ivory/80">
              <Phone className="h-4 w-4 text-gold" />
              <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" dir="ltr" className="hover:text-gold">{CONTACT.phoneDisplay}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-ivory/80">
              <Mail className="h-4 w-4 text-gold" />
              <span>info@azba.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ivory/80">
              <MapPin className="h-4 w-4 text-gold" />
              <span>القاهرة، مصر</span>
            </div>
          </div>
        </nav>

        {/* CTA */}
        <div className="px-6 pb-8 pt-4 border-t border-white/10">
          <Link
            href="/opportunities"
            onClick={onClose}
            className="btn-gold w-full text-center"
          >
            <TrendingUp className="h-5 w-5" />
            ابدأ الاستثمار
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ivory/50">
            <Link href="/login" onClick={onClose} className="hover:text-gold transition-colors">
              تسجيل الدخول
            </Link>
            <span className="h-3 w-px bg-white/20" />
            <Link href="/register" onClick={onClose} className="hover:text-gold transition-colors">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
