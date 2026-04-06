import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border-[1.5px] border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#0D0D0D] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:border-[#1B4FD8] focus-visible:ring-2 focus-visible:ring-[#1B4FD8]/15 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
