'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, FolderKanban, BarChart3, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/portfolio', label: 'محفظتي', icon: Wallet },
  { href: '/dashboard/projects', label: 'المشاريع', icon: FolderKanban },
  { href: '/dashboard/finance/reports', label: 'التقارير', icon: BarChart3 },
]

/**
 * شريط أيقونات ثابت أسفل الصفحات التسويقية (نفس أسلوب شريط لوحة التحكم).
 * بيختفي تلقائيًا داخل /dashboard لأنه هناك بيستخدم الشريط الأصلي.
 */
export function MarketingBottomNav() {
  const pathname = usePathname() || ''
  if (pathname.startsWith('/dashboard')) return null

  const isActive = (item: typeof ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const openMore = () => window.dispatchEvent(new CustomEvent('azba:open-menu'))

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-primary-950/75 px-safe pb-safe backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-2 px-3 pb-1.5 pt-2">
        {ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-[10px] leading-tight backdrop-blur-md transition-all',
                active
                  ? 'border-gold/40 bg-gold/15 font-bold text-gold shadow-sm'
                  : 'border-white/15 bg-white/5 text-ivory/70 hover:border-gold/30 hover:text-white'
              )}
            >
              <item.icon className={cn('h-[18px] w-[18px] sm:h-5 sm:w-5', active && 'text-gold')} />
              {item.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={openMore}
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/15 bg-white/5 px-1 py-2 text-[10px] leading-tight text-ivory/70 backdrop-blur-md transition-all hover:border-gold/30 hover:text-white"
        >
          <Menu className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          المزيد
        </button>
      </div>
    </nav>
  )
}

export default MarketingBottomNav
