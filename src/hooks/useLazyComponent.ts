import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

interface UseLazyComponentOptions {
  /**
   * 预加载延迟时间（毫秒）
   * @default 0
   */
  preloadDelay?: number

  /**
   * 是否启用预加载
   * @default true
   */
  enablePreload?: boolean
}

/**
 * 懒加载组件的自定义 Hook
 *
 * @param importFn 动态导入函数
 * @param options 配置选项
 * @returns 预加载处理函数
 */
export function useLazyComponent<T = unknown>(
  importFn: () => Promise<T>,
  options: UseLazyComponentOptions = {},
) {
  const { preloadDelay = 0, enablePreload = true } = options

  const [isPreloaded, setIsPreloaded] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const preload = useEvent(() => {
    if (!enablePreload || isPreloaded) {
      return
    }

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 设置预加载延迟
    timeoutRef.current = setTimeout(() => {
      importFn()
        .then(() => {
          setIsPreloaded(true)
        })
        .catch((error: unknown) => {
          console.warn('预加载组件失败:', error)
        })
    }, preloadDelay)
  })

  const cancelPreload = useEvent(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  })

  return {
    preload,
    cancelPreload,
    isPreloaded,
  }
}
