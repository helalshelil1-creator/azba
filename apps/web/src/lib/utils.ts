import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEGP(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' ج.م'
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-EG').format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 1 }).format(value) + '٪'
}
