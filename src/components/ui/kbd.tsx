import { forwardRef } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/utils'

const keyboardKeyVariants = cva(
  'pointer-events-none inline-flex select-none items-center gap-1 rounded border bg-muted font-mono font-semibold',
  {
    variants: {
      size: {
        default: 'h-5 px-1.5 text-[10px]',
        sm: 'h-4 px-1 text-[9px]',
        lg: 'h-6 px-2 text-xs',
      },
      variant: {
        default: 'border bg-muted',
        outline: 'border-2 bg-background',
        ghost: 'border-transparent bg-muted/50',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
)

interface KeyboardKeyProps
  extends React.ComponentProps<'kbd'>,
  VariantProps<typeof keyboardKeyVariants> {}

const KeyboardKey = forwardRef<HTMLElement, KeyboardKeyProps>(
  ({ className, size, variant, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(keyboardKeyVariants({ size, variant, className }))}
        {...props}
      >
        {children}
      </kbd>
    )
  },
)

KeyboardKey.displayName = 'KeyboardKey'

export { KeyboardKey, keyboardKeyVariants }
