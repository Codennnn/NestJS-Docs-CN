'use client'

import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

export function ThemeDropdownMenuItems() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <DropdownMenuItem variant={theme === 'light' ? 'highlight' : 'default'} onClick={() => { setTheme('light') }}>
        亮色
      </DropdownMenuItem>

      <DropdownMenuItem variant={theme === 'dark' ? 'highlight' : 'default'} onClick={() => { setTheme('dark') }}>
        暗色
      </DropdownMenuItem>

      <DropdownMenuItem variant={theme === 'system' ? 'highlight' : 'default'} onClick={() => { setTheme('system') }}>
        跟随系统
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
      <DropdownMenuTrigger asChild>
        <Button size="icon" title="切换主题" variant="outline" {...triggerButtonProps}>
          <SunIcon className="rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-all" size={18} />
          <MoonIcon className="absolute rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <ThemeDropdownMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
