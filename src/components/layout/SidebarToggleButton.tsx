'use client'

import { useState } from 'react'

import { PanelLeftCloseIcon, PanelLeftIcon, PanelRightCloseIcon, PanelRightIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useSidebar } from '~/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'

export function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar()

  const isExpanded = state === 'expanded'
  const [isHovered, setIsHovered] = useState(false)

  const label = isExpanded ? '收起侧边栏' : '展开侧边栏'

  return (
    <Tooltip delayDuration={800}>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className="size-7"
          size="icon"
          variant="ghost"
          onClick={() => { toggleSidebar() }}
          onMouseEnter={() => { setIsHovered(true) }}
          onMouseLeave={() => { setIsHovered(false) }}
        >
          {isExpanded
            ? isHovered
              ? <PanelLeftCloseIcon className="size-4" />
              : <PanelLeftIcon className="size-4" />
            : isHovered
              ? <PanelRightCloseIcon className="size-4" />
              : <PanelRightIcon className="size-4" />}
        </Button>
      </TooltipTrigger>

      <TooltipContent side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
