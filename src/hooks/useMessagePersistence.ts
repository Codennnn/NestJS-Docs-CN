'use client'

import { useCallback, useRef, useState } from 'react'

import { useChatSessions } from '~/hooks/useChatSessions'
import type { ChatMessage } from '~/types/chat'

interface UseMessagePersistenceOptions {
  /**
   * 当前会话 ID
   */
  sessionId?: string | null
  /**
   * 保存状态变化回调
   */
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'error' | 'idle') => void
  /**
   * 会话变化回调
   */
  onSessionChange?: (sessionId: string) => void
}

interface UseMessagePersistenceReturn {
  /**
   * 当前会话 ID
   */
  currentSessionId: string | null
  /**
   * 保存新消息到当前会话
   */
  saveMessages: (messages: ChatMessage[]) => void
  /**
   * 恢复会话消息
   */
  restoreSessionMessages: (sessionId: string) => ChatMessage[]
  /**
   * 确保会话存在（延迟创建）
   */
  ensureSession: () => string
  /**
   * 清空当前会话状态
   */
  clearSession: () => void
}

/**
 * 管理消息持久化的自定义 Hook
 *
 * 功能包括：
 * - 保存新消息到本地存储
 * - 恢复历史会话消息
 * - 管理会话的创建和切换
 * - 处理保存状态的反馈
 *
 * @param options 配置选项
 * @returns 消息持久化相关的状态和方法
 */
export function useMessagePersistence(
  options: UseMessagePersistenceOptions = {},
): UseMessagePersistenceReturn {
  const {
    sessionId,
    onSaveStatusChange,
    onSessionChange,
  } = options

  const {
    createSession,
    appendMessage,
    getSession,
  } = useChatSessions()

  // 内部会话 ID 状态（使用 state 而非 ref，避免在渲染期间读取 ref）
  const [internalSessionId, setInternalSessionId] = useState<string | null>(null)
  const lastMessageCountRef = useRef(0)

  // 当前会话 ID（优先使用外部传入的）
  const currentSessionId = sessionId ?? internalSessionId

  /**
   * 确保会话存在的辅助函数
   * 只在需要时才创建会话（延迟创建）
   */
  const ensureSession = useCallback((): string => {
    if (currentSessionId) {
      return currentSessionId
    }

    // 创建新的聊天会话
    const newSession = createSession()

    if (sessionId === undefined) {
      setInternalSessionId(newSession.id)
    }

    onSessionChange?.(newSession.id)

    return newSession.id
  }, [currentSessionId, sessionId, createSession, onSessionChange])

  /**
   * 保存新消息到当前会话
   */
  const saveMessages = useCallback((messages: ChatMessage[]) => {
    const activeSessionId = currentSessionId

    if (!activeSessionId || messages.length <= lastMessageCountRef.current) {
      return
    }

    // 只保存新增的消息
    const newMessages = messages.slice(lastMessageCountRef.current)

    if (newMessages.length === 0) {
      return
    }

    onSaveStatusChange?.('saving')

    try {
      newMessages.forEach((msg) => {
        const chatMessage: ChatMessage = {
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ?? Date.now(),
          interactionId: msg.interactionId,
        }

        appendMessage(activeSessionId, chatMessage)
      })

      lastMessageCountRef.current = messages.length
      onSaveStatusChange?.('saved')
    }
    catch (error) {
      console.error('保存消息失败：', error)
      onSaveStatusChange?.('error')
    }
  }, [currentSessionId, appendMessage, onSaveStatusChange])

  /**
   * 恢复会话消息
   */
  const restoreSessionMessages = useCallback((sessionId: string): ChatMessage[] => {
    const session = getSession(sessionId)

    if (session && session.messages.length > 0) {
      const restoredMessages: ChatMessage[] = session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        interactionId: msg.interactionId,
      }))

      lastMessageCountRef.current = restoredMessages.length

      return restoredMessages
    }

    // 新会话或空会话
    lastMessageCountRef.current = 0

    return []
  }, [getSession])

  /**
   * 清空当前会话状态
   */
  const clearSession = useCallback(() => {
    setInternalSessionId(null)
    lastMessageCountRef.current = 0
  }, [])

  return {
    currentSessionId,
    saveMessages,
    restoreSessionMessages,
    ensureSession,
    clearSession,
  }
}
