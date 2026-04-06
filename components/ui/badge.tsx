import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-[#EEF2FF] text-[#1B4FD8]',
        secondary:   'border-transparent bg-[#F5F5F7] text-[#6B7280]',
        destructive: 'border-transparent bg-[#FEE2E2] text-[#DC2626]',
        success:     'border-transparent bg-[#DCFCE7] text-[#15803D]',
        warning:     'border-transparent bg-[#FEF3C7] text-[#92400E]',
        outline:     'border-[#E4E4E7] text-[#0D0D0D]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
