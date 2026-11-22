import React from 'react'
import { cn } from './utils'

export interface LogoProps {
  className?: string
  size?: number
  variant?: 'color' | 'monochrome' | 'light' | 'dark'
  showText?: boolean
  lang?: 'ar' | 'en'
}

const INK = '#08130C'

const VARIANTS: Record<
  NonNullable<LogoProps['variant']>,
  { ring: string; gold: string; green: string; greenDark: string; ink: string; bg: string }
> = {
  color: { ring: '#DAA520', gold: 'url(#azba-gold)', green: 'url(#azba-leaf)', greenDark: '#006400', ink: INK, bg: 'transparent' },
  monochrome: { ring: '#123B2A', gold: '#123B2A', green: '#123B2A', greenDark: '#123B2A', ink: '#123B2A', bg: 'transparent' },
  light: { ring: '#F5F1E8', gold: '#F5F1E8', green: '#A8C6A8', greenDark: '#527A58', ink: '#061A12', bg: 'transparent' },
  dark: { ring: '#000000', gold: 'url(#azba-gold)', green: 'url(#azba-leaf)', greenDark: '#006400', ink: INK, bg: '#050505' },
}

function BullMark({ size, variant = 'color' }: { size: number; variant: NonNullable<LogoProps['variant']> }) {
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
      <defs>
        <linearGradient id="azba-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF6B0" />
          <stop offset="0.4" stopColor="#FFD700" />
          <stop offset="0.75" stopColor="#DAA520" />
          <stop offset="1" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="azba-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8CE600" />
          <stop offset="1" stopColor="#006400" />
        </linearGradient>
      </defs>

      {/* Circular frame — open at the bottom where the leaves emerge */}
      <circle
        cx="60"
        cy="55"
        r="52"
        stroke={c.ring}
        strokeWidth="3.4"
        strokeDasharray="268 60"
        strokeLinecap="round"
        transform="rotate(90 60 55)"
      />
      <circle cx="60" cy="55" r="45" stroke={c.ring} strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />

      {/* Botanical leaves — gold on the left, greens on the right */}
      <path d="M31 84 C 21 72, 19 60, 25 50 C 31 58, 35 68, 35 78 Z" fill={c.gold} />
      <path d="M89 84 C 99 72, 101 60, 95 50 C 89 58, 85 68, 85 78 Z" fill={c.green} />
      <path d="M97 91 C 105 81, 107 71, 101 63 C 95 71, 93 81, 93 89 Z" fill={c.greenDark} />

      {/* Geometric bull head — profile facing right */}
      <g>
        <path d="M48 34 C 38 22, 28 18, 17 18" stroke={c.gold} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M60 30 C 66 15, 76 9, 89 9" stroke={c.gold} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M42 42 L29 38 L38 52 Z" fill={c.gold} />
        <path
          d="M42 40 L58 32 L80 40 L91 52 L85 65 L66 69 L50 62 L40 52 Z"
          fill={c.gold}
          stroke={c.greenDark}
          strokeWidth="0.75"
          opacity="0.98"
        />
        <path d="M62 46 L74 48 L72 52 L62 50 Z" fill={c.ink} />
        <circle cx="85" cy="58" r="2.2" fill={c.ink} />
        <path d="M64 65 L81 60" stroke={c.ink} strokeWidth="1.6" strokeLinecap="round" />
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
              'text-2xl font-bold tracking-tight',
              variant === 'light' ? 'text-ivory' : 'text-primary'
            )}
            style={{ fontFamily: "'Instrument Serif', 'Times New Roman', serif" }}
          >
            AZBA
          </span>
          <span
            className={cn(
              'text-xs font-semibold tracking-widest',
              variant === 'light' ? 'text-gold' : 'text-gold-600'
            )}
            style={{ fontFamily: lang === 'ar' ? "'Tajawal','Cairo',sans-serif" : "'Montserrat',sans-serif" }}
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

/**
 * أيقونة التطبيق: مربع بزوايا مستديرة على خلفية سوداء مع الشعار الذهبي.
 */
export function AppIcon({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-[22%] shadow-xl', className)}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(160deg, #0A0A0A 0%, #000000 100%)',
        padding: size * 0.14,
      }}
    >
      <BullMark size={size * 0.72} variant="color" />
    </span>
  )
}

export default Logo
