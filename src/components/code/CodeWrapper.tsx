import { cn } from '~/lib/utils'

interface CodeWrapperProps {
  className?: string
}

export function CodeWrapper(props: React.PropsWithChildren<CodeWrapperProps>) {
  const { className, children } = props

  return (
    <div
      className={cn(
        'not-prose border border-border rounded-lg overflow-hidden max-w-full w-full group/code-block bg-muted/40',
        className,
      )}
    >
      {children}
    </div>
  )
}
