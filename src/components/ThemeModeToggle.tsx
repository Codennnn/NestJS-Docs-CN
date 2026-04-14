'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/menu'
import { cn } from '~/lib/utils'

export function ThemeDropdownMenuItems() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <DropdownMenuItem
        className={cn(theme === 'light' && 'bg-accent text-accent-foreground')}
        onClick={() => { setTheme('light') }}
      >
        <span className="flex items-center gap-2">
          <SunIcon className="size-4" />
          <span>明亮</span>
        </span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className={cn(theme === 'dark' && 'bg-accent text-accent-foreground')}
        onClick={() => { setTheme('dark') }}
      >
        <span className="flex items-center gap-2">
          <MoonIcon className="size-4" />
          <span>暗黑</span>
        </span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className={cn(theme === 'system' && 'bg-accent text-accent-foreground')}
        onClick={() => { setTheme('system') }}
      >
        <span className="flex items-center gap-2">
          <SunMoonIcon className="size-4" />
          <span>自动</span>
        </span>
      </DropdownMenuItem>
    </>
  )
}

interface ThemeModeToggleProps {
  triggerButtonProps?: React.ComponentProps<typeof Button>
}

export function ThemeModeToggle(props: ThemeModeToggleProps) {
  const { triggerButtonProps } = props

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <Button size="icon" title="切换主题" variant="outline" {...triggerButtonProps}>
            <SunIcon className="rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" size={18} />
            <MoonIcon className="absolute rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" size={18} />
          </Button>
        )}
      />

      <DropdownMenuContent align="end">
        <ThemeDropdownMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
