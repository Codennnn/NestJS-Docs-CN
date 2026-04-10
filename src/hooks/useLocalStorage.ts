import { startTransition, useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

type Operation = 'read' | 'write' | 'remove'

interface UseLocalStorageOptions<T> {
  /** 默认值 */
  defaultValue?: T
  /** 序列化函数 */
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
  /** 错误处理函数 */
  onError?: (error: Error, operation: Operation) => void
}

/**
 * 通用的 localStorage 操作 hook
 * 提供类型安全的 localStorage 操作，自动处理 JSON 序列化/反序列化和错误处理
 *
 * @param key localStorage 键名
 * @param options 配置选项
 * @returns [value, setValue, removeValue, isLoading]
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {},
) {
  const {
    defaultValue,
    serializer = {
      stringify: JSON.stringify,
      parse: JSON.parse,
    },
    onError,
  } = options

  const [storedValue, setStoredValue] = useState<T | undefined>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  // 读取 localStorage 数据
  const readValue = useEvent((): T | undefined => {
    try {
      const item = localStorage.getItem(key)

      if (item === null) {
        return defaultValue
      }

      return serializer.parse(item) as T
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err, 'read')
      console.warn(`读取 localStorage 键 "${key}" 失败:`, err)

      return defaultValue
    }
  })

  // 初始化加载数据
  useEffect(() => {
    const value = readValue()
    startTransition(() => {
      setStoredValue(value)
      setIsLoading(false)
    })
  }, [readValue])

  // 写入数据
  const setValue = useEvent((value: T | ((prev: T | undefined) => T)) => {
    try {
      // 支持函数式更新
      const valueToStore = typeof value === 'function'
        ? (value as (prev: T | undefined) => T)(storedValue)
        : value

      setStoredValue(valueToStore)
      localStorage.setItem(key, serializer.stringify(valueToStore))
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err, 'write')
      console.warn(`写入 localStorage 键 "${key}" 失败:`, err)
    }
  })

  // 删除数据
  const removeValue = useEvent(() => {
    try {
      setStoredValue(defaultValue)
      localStorage.removeItem(key)
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err, 'remove')
      console.warn(`删除 localStorage 键 "${key}" 失败:`, err)
    }
  })

  // 监听其他窗口/标签页的 localStorage 变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === localStorage) {
        if (e.newValue === null) {
          setStoredValue(defaultValue)
        }
        else {
          try {
            setStoredValue(serializer.parse(e.newValue) as T)
          }
          catch (error) {
            const err = error instanceof Error ? error : new Error(String(error))
            onError?.(err, 'read')
            console.warn('解析 localStorage 变化数据失败:', err)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, defaultValue, serializer, onError])

  return [storedValue, setValue, removeValue, isLoading] as const
}

/**
 * 便捷的数组类型 localStorage hook
 */
export function useLocalStorageArray<T>(
  key: string,
  options: Omit<UseLocalStorageOptions<T[]>, 'defaultValue'> & { defaultValue?: T[] } = {},
) {
  const { defaultValue = [], ...restOptions } = options

  return useLocalStorage<T[]>(key, {
    ...restOptions,
    defaultValue,
  })
}

/**
 * 便捷的对象类型 localStorage hook
 */
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  options: Omit<UseLocalStorageOptions<T>, 'defaultValue'> & { defaultValue?: T } = {},
) {
  const { defaultValue = {} as T, ...restOptions } = options

  return useLocalStorage<T>(key, {
    ...restOptions,
    defaultValue,
  })
}
