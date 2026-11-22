import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-ivory shadow-lg shadow-primary/20 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
        gold: 'bg-gold text-primary-900 shadow-lg shadow-gold/30 hover:bg-gold-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
        outline: 'border-2 border-primary/20 bg-transparent text-primary hover:border-gold hover:text-gold-600 hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'text-primary hover:bg-primary/5',
        destructive: 'bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-red-700',
        link: 'text-gold-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
