import { cn } from '~/lib/utils'

interface TextShimmerProps {
  fadeColor?: string
  textColor?: string
  className?: string
}

export function TextShimmer(props: React.PropsWithChildren<TextShimmerProps>) {
  const {
    children,
    fadeColor = 'var(--color-muted-foreground)',
    textColor = 'var(--color-foreground)',
    className,
  } = props

  return (
    <span
      className={cn('text-shimmer', className)}
      style={{
        '--color-from': fadeColor,
        '--color-via': textColor,
        '--color-to': fadeColor,
      } as React.CSSProperties}
    >
      {children}
    </span>
  )
}
