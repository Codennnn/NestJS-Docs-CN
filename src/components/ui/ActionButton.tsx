import type { ComponentProps, ReactNode } from 'react'

import { cn } from '~/lib/utils'

import { Button } from './button'
import { Tooltip, TooltipPopup, TooltipTrigger } from './tooltip'

interface ActionButtonProps {
  /** 按钮显示的图标 */
  icon: ReactNode
  /** Tooltip 内容，支持字符串或 React 节点 */
  tooltip?: ReactNode
  /** 按钮点击回调 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
  buttonSize?: ComponentProps<typeof Button>['size']
  /** Tooltip 显示位置 */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * 操作按钮组件，用于 PopupHeader 和 PopupFooter 中的图标按钮
 * 自动包装 Tooltip 和 Button
 */
export function ActionButton(props: ActionButtonProps) {
  const {
    icon,
    tooltip,
    onClick,
    className,
    buttonSize = 'icon-sm',
    tooltipSide = 'top',
  } = props

  return (
    <Tooltip>
      <TooltipTrigger
        render={(
          <Button
            className={cn('shrink-0 text-muted-foreground', className)}
            size={buttonSize}
            variant="ghost"
            onClick={onClick}
          >
            {icon}
          </Button>
        )}
      />

      <TooltipPopup
        positionerClassName="z-(--z-popup-plus)"
        side={tooltipSide}
      >
        {tooltip}
      </TooltipPopup>
    </Tooltip>
  )
}
