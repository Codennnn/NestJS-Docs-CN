'use client'

import { useState } from 'react'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipPopup, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import { copyToClipboard } from '~/utils/copy'

interface CodeCopyButtonProps {
  text: string
  className?: string
}

export function CodeCopyButton(props: CodeCopyButtonProps) {
  const { text, className } = props

  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(
      text,
      {
        onSuccess: () => {
          setCopied(true)

          setTimeout(() => {
            setCopied(false)
          }, 1000)
        },
      },
    )
  }

  return (
    <Tooltip open={copied || open} onOpenChange={setOpen}>
      <TooltipTrigger
        render={(
          <Button
            className={cn(
              'size-6 rounded-md hover:bg-background dark:hover:bg-background/20',
              'group-hover/code-block:opacity-100 opacity-0 transition-opacity duration-200',
              (copied || open) && 'opacity-100',
              className,
            )}
            size="icon"
            variant="ghost"
            onClick={() => {
              void handleCopy()
            }}
          />
        )}
      >
        {copied
          ? (
              <CheckIcon className="size-[1em] text-success" strokeWidth={3} />
            )
          : (
              <CopyIcon className="size-[1em]" />
            )}
      </TooltipTrigger>

      <TooltipPopup>
        {copied ? '已复制' : '复制代码'}
      </TooltipPopup>
    </Tooltip>
  )
}
