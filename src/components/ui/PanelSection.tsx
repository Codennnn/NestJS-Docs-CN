import type { ComponentProps, ReactNode } from 'react'

import { cn } from '~/lib/utils'

export interface PanelSectionProps extends ComponentProps<'div'> {
  label: string
  actions?: ReactNode
  /** Header 区域的额外样式，用于覆盖默认的内边距等 */
  headerClassName?: string
}

export function PanelSection(props: PanelSectionProps): React.ReactElement {
  const {
    label,
    actions,
    headerClassName,
    className,
    children,
    ...restProps
  } = props

  return (
    <div
      className={cn('flex flex-col', className)}
      data-slot="panel-section"
      {...restProps}
    >
      <div
        className={cn(
          'flex items-center justify-between px-2 py-1',
          headerClassName,
        )}
        data-slot="panel-section-header"
      >
        <span className="text-xs text-muted-foreground">{label}</span>
        {actions && (
          <div className="flex items-center gap-0.5">{actions}</div>
        )}
      </div>

      {children}
    </div>
  )
}
