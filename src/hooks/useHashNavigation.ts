'use client'

import { useEffect } from 'react'
import { useEvent } from 'react-use-event-hook'

import { usePathname } from 'next/navigation'

interface UseHashNavigationOptions {
  /**
   * 滚动容器的 ID
   */
  containerId: string
  /**
   * 滚动偏移量，用于调整最终滚动位置
   * @default 80
   */
  offset?: number
  /**
   * 滚动行为
   * @default 'smooth'
   */
  behavior?: ScrollBehavior
  /**
   * 延迟执行滚动的时间（毫秒），用于确保页面内容已渲染
   * @default 100
   */
  delay?: number
}

/**
 * 在指定容器内监听 URL hash 变化并自动滚动到对应锚点的 hook
 *
 * @param options 配置选项
 */
export function useHashNavigation(options: UseHashNavigationOptions) {
  const {
    containerId,
    offset = 28,
    behavior = 'smooth',
    delay = 100,
  } = options

  const pathname = usePathname()

  const scrollToElement = useEvent((elementId: string) => {
    const scrollContainer = document.getElementById(containerId)
    const targetElement = document.getElementById(elementId)

    if (!scrollContainer || !targetElement) {
      return
    }

    // 获取容器和目标元素的位置信息
    const containerRect = scrollContainer.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()

    // 计算目标元素相对于滚动容器的位置
    const targetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - offset

    // 滚动到目标位置
    scrollContainer.scrollTo({
      top: Math.max(0, targetTop), // 确保不会滚动到负数位置
      behavior,
    })
  })

  const handleHashChange = useEvent(() => {
    const rawHash = window.location.hash.slice(1) // 移除 '#' 符号

    if (rawHash) {
      // 解码 URL 编码的 hash，处理中文等特殊字符
      let decodedHash: string

      try {
        decodedHash = decodeURIComponent(rawHash)
      }
      catch (error) {
        // 如果解码失败，使用原始 hash
        console.warn('Failed to decode hash:', rawHash, error)
        decodedHash = rawHash
      }

      // 延迟执行以确保页面内容已渲染
      setTimeout(() => {
        scrollToElement(decodedHash)
      }, delay)
    }
  })

  // 监听 hash 变化
  useEffect(() => {
    // 页面加载时检查初始 hash
    handleHashChange()

    // 监听 hashchange 事件
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [handleHashChange])

  // 路径变化时重新检查 hash
  useEffect(() => {
    // 延迟执行以确保新页面内容已渲染
    const timer = setTimeout(() => {
      handleHashChange()
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname, handleHashChange, delay])

  return {
    scrollToElement,
  }
}
