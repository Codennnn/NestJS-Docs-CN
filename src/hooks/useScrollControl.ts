'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

interface UseScrollControlOptions {
  /**
   * 距离底部多少像素内认为是接近底部
   * @default 100
   */
  bottomThreshold?: number
  /**
   * 用户停止滚动后多少毫秒认为滚动结束
   * @default 1000
   */
  scrollEndDelay?: number
  /**
   * 滚动到底部的延迟时间（毫秒）
   * @default 50
   */
  scrollDelay?: number
}

interface UseScrollControlReturn {
  /**
   * 滚动容器的 ref
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  /**
   * 消息末尾的 ref（用于滚动定位）
   */
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  /**
   * 用户是否正在滚动
   */
  isUserScrolling: boolean
  /**
   * 是否接近底部
   */
  isNearBottom: boolean
  /**
   * 滚动到底部
   */
  scrollToBottom: () => void
  /**
   * 智能滚动到底部（只在用户接近底部且没有主动滚动时才滚动）
   */
  smartScrollToBottom: () => void
  /**
   * 检查是否接近底部
   */
  checkIfNearBottom: () => boolean
  /**
   * 处理滚动事件的函数
   */
  handleScroll: () => void
  /**
   * 重置用户滚动状态（强制滚动到底部）
   */
  resetScrollState: () => void
}

/**
 * 管理滚动行为的自定义 Hook
 *
 * 功能包括：
 * - 检测用户是否正在滚动
 * - 判断是否接近底部
 * - 提供智能滚动功能（避免打断用户滚动）
 * - 管理滚动相关的状态和定时器
 *
 * @param options 配置选项
 * @returns 滚动控制相关的状态和方法
 */
export function useScrollControl(options: UseScrollControlOptions = {}): UseScrollControlReturn {
  const {
    bottomThreshold = 100,
    scrollEndDelay = 1000,
    scrollDelay = 50,
  } = options

  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 滚动到底部
   */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, scrollDelay)
  }, [scrollDelay])

  /**
   * 检查是否接近底部
   */
  const checkIfNearBottom = useCallback((): boolean => {
    const container = scrollContainerRef.current

    if (!container) {
      return true
    }

    const { scrollTop, scrollHeight, clientHeight } = container

    return scrollHeight - scrollTop - clientHeight <= bottomThreshold
  }, [bottomThreshold])

  /**
   * 处理用户滚动事件
   */
  const handleScroll = useEvent(() => {
    const nearBottom = checkIfNearBottom()
    setIsNearBottom(nearBottom)

    // 标记用户正在滚动
    setIsUserScrolling(true)

    // 清除之前的定时器
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current)
    }

    // 延迟后认为用户停止滚动
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, scrollEndDelay)
  })

  /**
   * 智能滚动到底部
   * 只在用户接近底部且没有主动滚动时才自动滚动
   */
  const smartScrollToBottom = useCallback(() => {
    if (isNearBottom && !isUserScrolling) {
      scrollToBottom()
    }
  }, [isNearBottom, isUserScrolling, scrollToBottom])

  /**
   * 重置用户滚动状态（强制滚动到底部）
   * 用于用户发送消息或点击相关问题时
   */
  const resetScrollState = useCallback(() => {
    setIsUserScrolling(false)
    setIsNearBottom(true)
    scrollToBottom()
  }, [scrollToBottom])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    scrollContainerRef,
    messagesEndRef,
    isUserScrolling,
    isNearBottom,
    scrollToBottom,
    smartScrollToBottom,
    checkIfNearBottom,
    handleScroll,
    resetScrollState,
  }
}
