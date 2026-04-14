'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

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

const DEFAULT_OPTIONS: UseMessagePersistenceOptions = {}

/**
 * 根据消息内容生成签名字符串，用于变更检测
 */
function buildSignature(messages: ChatMessage[]): string {
  return JSON.stringify(
    messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      interactionId: msg.interactionId ?? '',
    })),
  )
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
  options: UseMessagePersistenceOptions = DEFAULT_OPTIONS,
): UseMessagePersistenceReturn {
  const {
    sessionId,
    onSaveStatusChange,
    onSessionChange,
  } = options

  const {
    createSession,
    getSession,
    replaceMessages,
  } = useChatSessions()

  const [internalSessionId, setInternalSessionId] = useState<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const pendingSaveRef = useRef<{
    sessionId: string
    signature: string
    messages: ChatMessage[]
  } | null>(null)
  const lastSavedSignatureRef = useRef(new Map<string, string>())

  const currentSessionId = sessionId ?? internalSessionId

  const flushPendingSave = useEvent(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    const pendingSave = pendingSaveRef.current

    if (!pendingSave) {
      return
    }

    try {
      replaceMessages(pendingSave.sessionId, pendingSave.messages)
      lastSavedSignatureRef.current.set(pendingSave.sessionId, pendingSave.signature)
      onSaveStatusChange?.('saved')
      pendingSaveRef.current = null
    }
    catch (error) {
      console.error('保存消息失败：', error)
      onSaveStatusChange?.('error')
    }
  })

  useEffect(() => {
    return () => {
      flushPendingSave()
    }
  }, [flushPendingSave])

  /**
   * 确保会话存在的辅助函数
   * 只在需要时才创建会话（延迟创建）
   */
  const ensureSession = useEvent((): string => {
    if (currentSessionId) {
      return currentSessionId
    }

    // 创建新的聊天会话
    const newSession = createSession()
    lastSavedSignatureRef.current.set(newSession.id, buildSignature(newSession.messages))

    if (sessionId === undefined) {
      setInternalSessionId(newSession.id)
    }

    onSessionChange?.(newSession.id)

    return newSession.id
  })

  /**
   * 保存新消息到当前会话
   */
  const saveMessages = useEvent((messages: ChatMessage[]) => {
    const activeSessionId = currentSessionId
    const signature = buildSignature(messages)

    if (!activeSessionId) {
      return
    }

    const lastSavedSignature = lastSavedSignatureRef.current.get(activeSessionId)
    const pendingSignature = pendingSaveRef.current?.sessionId === activeSessionId
      ? pendingSaveRef.current.signature
      : null

    if (signature === lastSavedSignature || signature === pendingSignature) {
      return
    }

    onSaveStatusChange?.('saving')
    pendingSaveRef.current = {
      sessionId: activeSessionId,
      signature,
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp ?? Date.now(),
      })),
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      flushPendingSave()
    }, 250)
  })

  /**
   * 恢复会话消息
   */
  const restoreSessionMessages = useEvent((targetSessionId: string): ChatMessage[] => {
    const session = getSession(targetSessionId)

    if (session && session.messages.length > 0) {
      const restoredMessages: ChatMessage[] = session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        interactionId: msg.interactionId,
      }))
      lastSavedSignatureRef.current.set(targetSessionId, buildSignature(restoredMessages))

      return restoredMessages
    }

    // 新会话或空会话
    lastSavedSignatureRef.current.set(targetSessionId, buildSignature([]))

    return []
  })

  /**
   * 清空当前会话状态
   */
  const clearSession = useEvent(() => {
    flushPendingSave()
    setInternalSessionId(null)
    pendingSaveRef.current = null
  })

  return {
    currentSessionId,
    saveMessages,
    restoreSessionMessages,
    ensureSession,
    clearSession,
  }
}
