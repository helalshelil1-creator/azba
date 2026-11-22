import React from 'react'
import { cn } from './utils'

export interface StatProps {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  trend?: { value: string; positive?: boolean }
  hint?: string
  className?: string
}

export function Stat({ label, value, icon: Icon, trend, hint, className }: StatProps) {
  return (
    <div className={cn('card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{value}</div>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
                trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  )
}
