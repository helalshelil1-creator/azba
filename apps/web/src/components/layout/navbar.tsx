'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Globe, LogIn, UserPlus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileMenu } from './mobile-menu'

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/invest', label: 'فرص الاستثمار' },
  { href: '/farms', label: 'المزارع' },
  { href: '/how-it-works', label: 'كيف نعمل؟' },
  { href: '/about', label: 'من نحن' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onOpen = () => setMobileOpen(true)
    window.addEventListener('azba:open-menu', onOpen)
    return () => window.removeEventListener('azba:open-menu', onOpen)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isTransparent = !scrolled && pathname === '/'

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled || pathname !== '/'
            ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-primary/5 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container-page">
          <div className="flex items-center justify-between gap-6">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors duration-300',
                    isTransparent
                      ? 'text-ivory/90 hover:text-white'
                      : 'text-foreground/80 hover:text-primary',
                    pathname === link.href && 'font-semibold',
                    pathname === link.href && (isTransparent ? 'text-white' : 'text-primary')
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-0.5 right-4 left-4 h-0.5 rounded-full bg-gold" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  isTransparent ? 'text-ivory/80 hover:text-white hover:bg-white/10' : 'text-foreground/70 hover:bg-primary/5'
                )}
                aria-label="Change language"
              >
                <Globe className="h-4 w-4" />
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>

              <Link
                href="/login"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isTransparent ? 'text-ivory hover:text-white hover:bg-white/10' : 'text-primary hover:bg-primary/5'
                )}
              >
                <LogIn className="h-4 w-4" />
                تسجيل الدخول
              </Link>

              <Link href="/register" className="btn-outline hidden xl:inline-flex">
                <UserPlus className="h-4 w-4" />
                إنشاء حساب
              </Link>

              <Link href="/invest" className="btn-gold">
                <TrendingUp className="h-4 w-4" />
                تصفّح المشاريع
              </Link>
            </div>

            {/* Mobile: lang + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
                className={cn(
                  'inline-flex items-center justify-center h-10 w-10 rounded-full transition-colors',
                  isTransparent ? 'text-ivory hover:bg-white/10' : 'text-primary hover:bg-primary/5'
                )}
                aria-label="Change language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className={cn(
                  'relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                  isTransparent ? 'text-ivory hover:bg-white/10' : 'text-primary hover:bg-primary/5'
                )}
                aria-label="Open menu"
              >
                <HamburgerIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} lang={lang} onLangChange={setLang} />
    </>
  )
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default Navbar
