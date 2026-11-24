'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Wallet, FolderKanban, Building2, User,
  LogOut, Menu, X, Bell, ChevronLeft, Settings, HelpCircle, ShieldCheck,
  Stethoscope, Coins, PawPrint, ClipboardList, Home,
} from 'lucide-react'
import { Logo } from '@azba/ui/logo'
import { useAuth } from '@/lib/auth-store'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: any
  exact?: boolean
  roles?: string[]
}

const NAV: NavItem[] = [
  { href: '/', label: 'الرئيسية', icon: Home, exact: true },
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/invest', label: 'الاستثمار', icon: Briefcase },
  { href: '/dashboard/portfolio', label: 'محفظتي', icon: Wallet },
  { href: '/dashboard/projects', label: 'مشاريعي', icon: FolderKanban },
  { href: '/dashboard/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/dashboard/account', label: 'حسابي', icon: User },
  { href: '/dashboard/farm', label: 'المزرعة', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'FARM_EMPLOYEE', 'VETERINARIAN', 'INVESTMENT_MANAGER'] },
  { href: '/dashboard/farm/animals', label: 'الحيوانات', icon: PawPrint, roles: ['SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'FARM_EMPLOYEE', 'VETERINARIAN', 'INVESTMENT_MANAGER'] },
  { href: '/dashboard/vet', label: 'البوابة البيطرية', icon: Stethoscope, roles: ['SUPER_ADMIN', 'ADMIN', 'VETERINARIAN', 'FARM_MANAGER'] },
  { href: '/dashboard/finance', label: 'المالية والمحاسبة', icon: Coins, roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'INVESTMENT_MANAGER'] },
  { href: '/dashboard/admin', label: 'لوحة الإدارة', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/admin/users', label: 'المستخدمون', icon: ClipboardList, roles: ['SUPER_ADMIN', 'ADMIN'] },
]

const SECONDARY = [
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
  { href: '/dashboard/support', label: 'المساعدة', icon: HelpCircle },
]

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (item: NavItem) =>
    item.href === '/' ? false : item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const items = NAV.filter((item) => !item.roles || (user?.role != null && item.roles.includes(user.role)))

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-border/60 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-5">
          <Link href="/" aria-label="AZBA">
            <Logo size={38} />
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/5 lg:hidden"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User */}
        <div className="border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-bold text-ivory">
              {user?.firstName?.[0] || 'م'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-primary">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                  isActive(item)
                    ? 'bg-primary text-ivory shadow-md shadow-primary/20'
                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive(item) ? 'text-gold' : 'text-muted-foreground group-hover:text-primary')} />
                {item.label}
                {isActive(item) && <ChevronLeft className="mr-auto h-4 w-4 text-gold" />}
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-border/60" />

          <div className="space-y-1">
            {SECONDARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:bg-primary/5 hover:text-primary"
              >
                <item.icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-border/60 px-3 py-4">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-ivory px-4 py-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
            أموال المستثمرين محفوظة في حسابات منفصلة
          </div>
        </div>
      </aside>
    </>
  )
}

export function DashboardHeader({ onMenuClick, title }: { onMenuClick: () => void; title: string }) {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-primary lg:hidden"
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-primary sm:text-xl">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-primary hover:bg-primary/5"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-gold" />
          </Link>
          <div className="hidden items-center gap-2 rounded-xl border border-border/60 px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-ivory">
              {user?.firstName?.[0] || 'م'}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-primary">{user?.firstName}</div>
              <div className="text-[10px] text-muted-foreground">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
