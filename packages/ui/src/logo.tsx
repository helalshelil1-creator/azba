import React from 'react'
import { cn } from './utils'

/**
 * شعار AZBA | عزبة الرسمي.
 * الأصل مرسوم من ملف الهوية الرسمي: `public/logo.webp` (رمز + AZBA + عزبة)
 * و`public/icon.png` (الرمز وحده للأيقونة وال favicon).
 * الخلفية شفافة، لذا يظهر الذهب على أي خلفية.
 */
export interface LogoProps {
  className?: string
  size?: number
  variant?: 'color' | 'monochrome' | 'light' | 'dark'
  showText?: boolean
  lang?: 'ar' | 'en'
}

export function Logo({ className, size = 48, showText = true }: LogoProps) {
  const src = showText ? '/logo.webp' : '/icon.png'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="AZBA | عزبة"
      width={size}
      height={size}
      style={{ height: size, width: 'auto' }}
      className={cn('inline-block select-none', className)}
      draggable={false}
    />
  )
}

export function LogoIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn('inline-block select-none', className)}
      draggable={false}
    />
  )
}

/**
 * أيقونة التطبيق: مربع بزوايا مستديرة على خلفية سوداء مع الرمز الذهبي.
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
      <img
        src="/icon.png"
        alt="AZBA"
        width={size * 0.72}
        height={size * 0.72}
        style={{ width: size * 0.72, height: size * 0.72 }}
        className="block"
        draggable={false}
      />
    </span>
  )
}

export default Logo
