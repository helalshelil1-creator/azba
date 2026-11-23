'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Store, Briefcase, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/invest', label: 'الاستثمارات', icon: Briefcase },
  { href: '/opportunities', label: 'الأسواق', icon: Store },
  { href: '/dashboard/portfolio', label: 'محفظتي', icon: Wallet },
]

export function MobileNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname()
  const isActive = (item: typeof ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/95 px-safe pb-safe-top backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
              isActive(item) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive(item) && 'text-gold')} />
            {item.label}
          </Link>
        ))}
        <button
          onClick={onMore}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
          المزيد
        </button>
      </div>
    </nav>
  )
}
