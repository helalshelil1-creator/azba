import React, { forwardRef } from 'react'
import { cn } from './utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'input-field',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'input-field min-h-[100px] resize-y',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label className={cn('label', className)} {...props}>
      {children}
      {required && <span className="mr-1 text-destructive">*</span>}
    </label>
  )
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'input-field appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[left_0.75rem_center] bg-no-repeat pl-10',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
