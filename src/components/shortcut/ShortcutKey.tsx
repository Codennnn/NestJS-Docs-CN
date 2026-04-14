import { startTransition, useEffect, useState } from 'react'

import { CommandIcon } from 'lucide-react'

import { Kbd } from '~/components/ui/kbd'
import { useKeyboardShortcut } from '~/hooks/useKeyboardShortcut'
import { cn } from '~/lib/utils'
import { isMacOS } from '~/utils/platform'

interface ShortcutKeyProps {
  /** 快捷键的主键（如 'k', 'i' 等） */
  mainKey: string
  /** 是否使用修饰键（Cmd/Ctrl），默认为 false */
  useModifier?: boolean
  /** 快捷键触发时的回调函数 */
  onShortcut?: () => void
  /** 是否启用快捷键监听，默认为 false */
  enableListener?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 快捷键组件 - 封装了跨平台快捷键的显示和事件处理
 *
 * 功能：
 * 1. 自动检测平台并显示正确的修饰键（Mac 显示 Cmd 图标，其他平台显示 Ctrl 文字）
 * 2. 自动监听键盘事件并触发回调
 * 3. 提供统一的快捷键显示样式
 */
export function ShortcutKey(props: ShortcutKeyProps) {
  const {
    mainKey,
    useModifier = false,
    enableListener = false,
    className,
    onShortcut,
  } = props

  const [isMac, setIsMac] = useState<boolean | null>(null)

  useEffect(() => {
    startTransition(() => {
      setIsMac(isMacOS())
    })
  }, [])

  // 使用封装的键盘快捷键 Hook
  useKeyboardShortcut(
    {
      key: mainKey,
      useModifier,
      onShortcut,
    },
    { enableListener },
  )

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {useModifier && isMac !== null && (
        <Kbd>
          {isMac
            ? (
                <CommandIcon className="size-2.5" />
              )
            : (
                'Ctrl'
              )}
        </Kbd>
      )}

      <Kbd>
        {mainKey.toUpperCase()}
      </Kbd>
    </div>
  )
}
