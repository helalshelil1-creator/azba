import React from 'react'
import { cn } from './utils'

export interface LogoProps {
  className?: string
  size?: number
  variant?: 'color' | 'monochrome' | 'light' | 'dark'
  showText?: boolean
  lang?: 'ar' | 'en'
}

const VARIANTS = {
  color: { primary: '#123B2A', accent: '#C9A45C', bg: 'transparent' },
  monochrome: { primary: '#123B2A', accent: '#123B2A', bg: 'transparent' },
  light: { primary: '#F5F1E8', accent: '#C9A45C', bg: 'transparent' },
  dark: { primary: '#061A12', accent: '#C9A45C', bg: 'transparent' },
}

function BullMark({ size, variant }: { size: number; variant: NonNullable<LogoProps['variant']> }) {
  const c = VARIANTS[variant]
  const s = size
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circular frame */}
      <circle cx="60" cy="60" r="56" stroke={c.primary} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="48" stroke={c.accent} strokeWidth="0.75" strokeDasharray="2 3" opacity="0.7" />

      {/* Botanical leaves - left */}
      <path
        d="M28 78 C 20 68, 18 58, 22 48 C 28 54, 32 62, 32 70 Z"
        fill={c.accent}
        opacity="0.85"
      />
      <path
        d="M22 84 C 16 76, 14 68, 16 60 C 22 65, 26 72, 26 79 Z"
        fill={c.accent}
        opacity="0.6"
      />
      {/* Botanical leaves - right */}
      <path
        d="M92 78 C 100 68, 102 58, 98 48 C 92 54, 88 62, 88 70 Z"
        fill={c.accent}
        opacity="0.85"
      />
      <path
        d="M98 84 C 104 76, 106 68, 104 60 C 98 65, 94 72, 94 79 Z"
        fill={c.accent}
        opacity="0.6"
      />

      {/* Geometric bull head */}
      <g stroke={c.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Horns */}
        <path d="M38 46 C 30 34, 24 30, 16 28" />
        <path d="M82 46 C 90 34, 96 30, 104 28" />
        {/* Horn inner */}
        <path d="M40 50 C 34 40, 29 36, 22 34" strokeWidth="1.5" opacity="0.6" />
        <path d="M80 50 C 86 40, 91 36, 98 34" strokeWidth="1.5" opacity="0.6" />
        {/* Head outline */}
        <path d="M44 52 L 60 40 L 76 52 L 76 72 L 60 84 L 44 72 Z" fill={c.primary} stroke="none" />
        {/* Ears */}
        <path d="M40 56 L 30 52 L 34 62 Z" fill={c.primary} stroke="none" />
        <path d="M80 56 L 90 52 L 86 62 Z" fill={c.primary} stroke="none" />
        {/* Eyes */}
        <circle cx="52" cy="62" r="2.5" fill="#F5F1E8" stroke="none" />
        <circle cx="68" cy="62" r="2.5" fill="#F5F1E8" stroke="none" />
        {/* Muzzle */}
        <path d="M54 76 L 60 80 L 66 76" stroke="#F5F1E8" strokeWidth="2" />
        {/* Nose ring */}
        <circle cx="60" cy="84" r="3" stroke={c.accent} strokeWidth="2" />
      </g>
    </svg>
  )
}

export function Logo({ className, size = 48, variant = 'color', showText = true, lang = 'ar' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <BullMark size={size} variant={variant} />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-heading text-2xl font-bold tracking-tight',
              variant === 'light' ? 'text-ivory' : 'text-primary'
            )}
            style={{ fontFamily: lang === 'en' ? 'var(--font-instrument)' : 'var(--font-tajawal)' }}
          >
            AZBA
          </span>
          <span
            className={cn('text-xs font-semibold tracking-widest', variant === 'light' ? 'text-gold' : 'text-gold-600')}
          >
            {lang === 'ar' ? 'عزبة' : 'AZBA'}
          </span>
        </span>
      )}
    </span>
  )
}

export function LogoIcon({ size = 40, variant = 'color', className }: { size?: number; variant?: NonNullable<LogoProps['variant']>; className?: string }) {
  return <BullMark size={size} variant={variant} />
}

export function AppIcon({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-[22%] shadow-xl',
        className
      )}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #123B2A 0%, #0C2A1E 60%, #061A12 100%)',
        padding: size * 0.14,
      }}
    >
      <BullMark size={size * 0.72} variant="light" />
    </span>
  )
}

export default Logo
