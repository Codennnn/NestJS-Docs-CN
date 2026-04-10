'use client'

import { useEffect, useState } from 'react'

import { answerPanelEvents, closeAnswerPanel, openAnswerPanel, toggleAnswerPanel } from '~/utils/answer-events'

/**
 * 用于管理 AnswerPanel 状态的自定义 Hook
 * @returns 包含状态和控制函数的对象
 */
export function useAnswerPanel() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 监听事件
    const unsubscribeOpen = answerPanelEvents.addEventListener('open', () => {
      setIsOpen(true)
    })

    const unsubscribeClose = answerPanelEvents.addEventListener('close', () => {
      setIsOpen(false)
    })

    const unsubscribeToggle = answerPanelEvents.addEventListener('toggle', () => {
      setIsOpen((prev) => !prev)
    })

    // 清理函数
    return () => {
      unsubscribeOpen()
      unsubscribeClose()
      unsubscribeToggle()
    }
  }, [])

  return {
    isOpen,
    open: openAnswerPanel,
    close: closeAnswerPanel,
    toggle: toggleAnswerPanel,
  }
}
