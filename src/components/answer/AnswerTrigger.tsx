'use client'

import { MessageCircleIcon } from 'lucide-react'

import { ShortcutKey } from '~/components/shortcut/ShortcutKey'

interface AnswerTriggerProps extends Pick<React.HTMLAttributes<HTMLButtonElement>, 'onMouseEnter'> {
  onTriggerOpen?: () => void
}

export function AnswerTrigger(props: AnswerTriggerProps) {
  const { onTriggerOpen, ...restButtonProps } = props

  return (
    <button
      className="group flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-all hover:text-accent-foreground"
      onClick={() => {
        onTriggerOpen?.()
      }}
      {...restButtonProps}
    >
      <div className="flex items-center shrink-0 justify-center">
        <MessageCircleIcon className="size-3.5" />
      </div>

      <span className="flex-1 text-xs truncate text-left">AI 问答助手</span>

      <ShortcutKey
        enableListener
        useModifier
        mainKey="i"
        onShortcut={() => {
          onTriggerOpen?.()
        }}
      />
    </button>
  )
}
