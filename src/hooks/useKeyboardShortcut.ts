import { useEffect } from 'react'

interface ShortcutConfig {
  /** 快捷键的主键 */
  key: string
  /** 是否使用修饰键，默认为 true */
  useModifier?: boolean
  /** 快捷键触发时的回调函数 */
  onShortcut?: () => void
}

interface UseKeyboardShortcutOptions {
  /** 是否启用快捷键监听，默认为 true */
  enableListener?: boolean
}

/**
 * 键盘快捷键监听 Hook
 *
 * 支持单个快捷键和多个快捷键的监听
 *
 * @param shortcuts 快捷键配置，可以是单个配置对象或配置数组
 * @param options 选项配置
 */
export function useKeyboardShortcut(
  shortcuts: ShortcutConfig | ShortcutConfig[],
  options: UseKeyboardShortcutOptions = {},
) {
  const { enableListener = true } = options

  useEffect(() => {
    if (!enableListener) {
      return
    }

    const shortcutArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts]

    const handleKeyDown = (ev: KeyboardEvent) => {
      // 防护性检查：确保 ev.key 存在
      if (ev.key) {
        const isModifierPressed = ev.metaKey || ev.ctrlKey

        for (const shortcut of shortcutArray) {
          const { key, useModifier = true, onShortcut } = shortcut

          if (onShortcut) {
            const isTargetKey = ev.key.toLowerCase() === key.toLowerCase()
            const shouldTrigger = useModifier
              ? isModifierPressed && isTargetKey
              : isTargetKey

            if (shouldTrigger) {
              ev.preventDefault()
              onShortcut()
              break // 只触发第一个匹配的快捷键
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enableListener])
}
