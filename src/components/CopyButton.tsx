import { useState } from 'react'

import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { copyToClipboard } from '~/utils/copy'

/**
 * 复制按钮组件的属性接口
 */
interface CopyButtonProps {
  /** 要复制的文本内容，如果为空则按钮将被禁用 */
  text?: string
}

/**
 * 复制按钮组件
 *
 * 提供一个可点击的按钮，用于将指定文本复制到剪贴板。
 * 复制成功后会显示确认图标，2秒后自动恢复到初始状态。
 */
export function CopyButton(props: CopyButtonProps) {
  const { text } = props

  // 复制状态，用于控制图标显示和用户反馈
  const [copied, setCopied] = useState(false)

  /**
   * 处理复制操作
   * 将文本复制到剪贴板，成功后更新UI状态
   */
  const handleCopy = async () => {
    if (text) {
      const result = await copyToClipboard(text)

      if (result.success) {
        setCopied(true)

        // 2秒后重置复制状态
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      }
    }
  }

  return (
    <Button
      disabled={!text}
      size="iconSm"
      variant="ghost"
      onClick={() => {
        void handleCopy()
      }}
    >
      {copied
        ? (
            <CheckIcon className="size-3 text-success" strokeWidth={3} />
          )
        : (
            <CopyIcon className="size-3" />
          )}
      <span className="sr-only">
        {copied ? '已复制' : '复制授权码'}
      </span>
    </Button>
  )
}
