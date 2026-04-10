'use client'

import { SearchIcon } from 'lucide-react'

import { ShortcutKey } from '~/components/shortcut/ShortcutKey'

interface SearchTriggerProps {
  onTriggerOpen?: () => void
}

export function SearchTrigger(props: SearchTriggerProps) {
  const { onTriggerOpen } = props

  return (
    <button
      className="group flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-all hover:text-accent-foreground"
      onClick={() => {
        onTriggerOpen?.()
      }}
    >
      <div className="flex items-center shrink-0 justify-center">
        <SearchIcon className="size-3.5" />
      </div>

      <span className="flex-1 text-xs truncate text-left">搜索文档...</span>

      <ShortcutKey
        enableListener
        useModifier
        mainKey="k"
        onShortcut={() => {
          onTriggerOpen?.()
        }}
      />
    </button>
  )
}
