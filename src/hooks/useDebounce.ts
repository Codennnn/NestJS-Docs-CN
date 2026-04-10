import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import { debounce, type DebounceSettings } from 'lodash-es'

interface UseDebounceOptions extends DebounceSettings {
  /** 防抖延迟时间（毫秒） */
  delay: number
  /** 是否启用防抖 */
  enabled?: boolean
}

type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel?: () => void
  flush?: () => void
}

/**
 * 通用防抖Hook，基于 lodash debounce
 */
export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  options: UseDebounceOptions,
) {
  const callbackRef = useRef(callback)
  // 在 layout effect 中同步 ref，避免在渲染期间直接写 ref
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  // 解构关键配置项，对基本类型进行单独依赖追踪
  const { delay, enabled = true, leading, trailing, maxWait } = options

  // 创建防抖函数，只依赖基本类型参数，避免对象引用问题
  const debouncedCallback = useMemo<DebouncedFunction<TArgs>>(() => {
    if (!enabled) {
      const immediate: DebouncedFunction<TArgs> = (...args: TArgs) => {
        callbackRef.current(...args)
      }

      return immediate
    }

    return debounce(
      // eslint-disable-next-line react-hooks/refs -- callbackRef.current 仅在防抖回调触发时读取，非渲染期间
      (...args: TArgs) => {
        callbackRef.current(...args)
      },
      delay,
      {
        leading: leading ?? false,
        trailing: trailing ?? true,
        maxWait,
      },
    ) as DebouncedFunction<TArgs>
  }, [delay, enabled, leading, trailing, maxWait])

  const debouncedCallbackRef = useRef(debouncedCallback)
  // 在 layout effect 中同步 ref，避免在渲染期间直接写 ref
  useLayoutEffect(() => {
    debouncedCallbackRef.current = debouncedCallback
  })

  // 清理函数
  useEffect(() => {
    return () => {
      const fn = debouncedCallbackRef.current

      if (typeof fn === 'function' && typeof fn.cancel === 'function') {
        fn.cancel()
      }
    }
  }, [])

  return {
    /**
     * 防抖后的回调函数
     */
    debouncedCallback,

    /**
     * 取消等待中的防抖执行
     */
    cancel: useCallback(() => {
      const fn = debouncedCallbackRef.current

      if (typeof fn === 'function' && typeof fn.cancel === 'function') {
        fn.cancel()
      }
    }, []),

    /**
     * 立即执行等待中的防抖函数
     */
    flush: useCallback(() => {
      const fn = debouncedCallbackRef.current

      if (typeof fn === 'function' && typeof fn.flush === 'function') {
        fn.flush()
      }
    }, []),
  }
}
