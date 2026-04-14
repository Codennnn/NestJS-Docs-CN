import { useCallback, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import type { ChatMessage, ChatSession, ChatSessionFilters, ChatSessionStats } from '~/types/chat'

import { useLocalStorageArray } from './useLocalStorage'

const STORAGE_KEY = 'doc-chat-sessions'
const MAX_SESSIONS = 100 // 最多保存 100 个会话

const STORAGE_OPTIONS = {
  defaultValue: [] as ChatSession[],
  onError: (error: Error, operation: string) => {
    console.warn(`聊天会话 ${operation} 操作失败：`, error)
  },
}

/**
 * 将指定索引的元素移到数组最前面（不可变写法）
 */
function moveToFront<T>(arr: T[], index: number): T[] {
  if (index <= 0) {
    return arr
  }

  return [arr[index], ...arr.slice(0, index), ...arr.slice(index + 1)]
}

// 生成会话 ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 生成会话标题（基于第一条用户消息）
function generateSessionTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user')

  if (!firstUserMessage) {
    return '新对话'
  }

  const content = firstUserMessage.content.trim()

  if (content.length <= 30) {
    return content
  }

  return `${content.substring(0, 30)}...`
}

export function useChatSessions() {
  const [sessions, setSessions, removeSessions, isLoading] = useLocalStorageArray<ChatSession>(
    STORAGE_KEY,
    STORAGE_OPTIONS,
  )

  const sessionsArray = useMemo(() => sessions ?? [], [sessions])

  // 创建新会话
  const createSession = useEvent((initialMessages: ChatMessage[] = []): ChatSession => {
    const now = Date.now()
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: generateSessionTitle(initialMessages),
      messages: initialMessages,
      createdAt: now,
      updatedAt: now,
      archived: false,
    }

    setSessions((prev) => {
      const updated = [newSession, ...(prev ?? [])]

      // 保持最大会话数限制：数组始终以 updatedAt 倒序维护，直接截断即可
      if (updated.length > MAX_SESSIONS) {
        return updated.slice(0, MAX_SESSIONS)
      }

      return updated
    })

    return newSession
  })

  // 添加消息到会话
  const appendMessage = useEvent((sessionId: string, message: ChatMessage) => {
    setSessions((prev) => {
      const updated = (prev ?? []).map((session) => {
        if (session.id === sessionId) {
          const messageWithTimestamp = {
            ...message,
            timestamp: message.timestamp ?? Date.now(),
          }
          const updatedMessages = [...session.messages, messageWithTimestamp]

          return {
            ...session,
            messages: updatedMessages,
            title: session.title === '新对话' ? generateSessionTitle(updatedMessages) : session.title,
            updatedAt: Date.now(),
          }
        }

        return session
      })

      // 将更新的会话移到最前面
      return moveToFront(updated, updated.findIndex((s) => s.id === sessionId))
    })
  })

  // 批量添加消息到会话
  const appendMessages = useEvent((sessionId: string, messages: ChatMessage[]) => {
    if (messages.length === 0) {
      return
    }

    setSessions((prev) => {
      const updated = (prev ?? []).map((session) => {
        if (session.id === sessionId) {
          const messagesWithTimestamp = messages.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp ?? Date.now(),
          }))
          const updatedMessages = [...session.messages, ...messagesWithTimestamp]

          return {
            ...session,
            messages: updatedMessages,
            title: session.title === '新对话' ? generateSessionTitle(updatedMessages) : session.title,
            updatedAt: Date.now(),
          }
        }

        return session
      })

      // 将更新的会话移到最前面
      return moveToFront(updated, updated.findIndex((s) => s.id === sessionId))
    })
  })

  // 用最新消息快照替换整个会话
  const replaceMessages = useEvent((sessionId: string, messages: ChatMessage[]) => {
    setSessions((prev) => {
      const updated = (prev ?? []).map((session) => {
        if (session.id !== sessionId) {
          return session
        }

        const normalizedMessages = messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp ?? Date.now(),
        }))

        return {
          ...session,
          messages: normalizedMessages,
          title: session.title === '新对话' ? generateSessionTitle(normalizedMessages) : session.title,
          updatedAt: Date.now(),
        }
      })

      return moveToFront(updated, updated.findIndex((s) => s.id === sessionId))
    })
  })

  // 更新会话标题
  const renameSession = useEvent((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, title: newTitle.trim() || '新对话', updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 归档会话（软删除）
  const archiveSession = useEvent((sessionId: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, archived: true, updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 恢复归档的会话
  const restoreSession = useEvent((sessionId: string) => {
    setSessions((prev) =>
      (prev ?? []).map((session) =>
        session.id === sessionId
          ? { ...session, archived: false, updatedAt: Date.now() }
          : session,
      ),
    )
  })

  // 永久删除会话
  const deleteSession = useEvent((sessionId: string) => {
    setSessions((prev) => (prev ?? []).filter((session) => session.id !== sessionId))
  })

  // 清空所有会话
  const clearAllSessions = useEvent(() => {
    removeSessions()
  })

  // 获取会话
  const getSession = useEvent((sessionId: string): ChatSession | undefined => {
    return sessionsArray.find((session) => session.id === sessionId)
  })

  const filterSessions = useCallback((filters: ChatSessionFilters = {}): ChatSession[] => {
    const searchLower = filters.searchTerm?.toLowerCase()

    // 单次遍历完成过滤 + 收集
    const filtered: ChatSession[] = []

    for (const session of sessionsArray) {
      // 过滤归档状态
      if (!filters.showArchived && session.archived) {
        continue
      }

      // 搜索过滤
      if (
        searchLower
        && !session.title.toLowerCase().includes(searchLower)
        && !session.messages.some((msg) => msg.content.toLowerCase().includes(searchLower))
      ) {
        continue
      }

      filtered.push(session)
    }

    // 排序：按更新时间降序
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [sessionsArray])

  const getStats = useEvent((): ChatSessionStats => {
    let activeSessions = 0
    let archivedSessions = 0
    let totalMessages = 0

    for (const session of sessionsArray) {
      if (session.archived) {
        archivedSessions++
      }
      else {
        activeSessions++
      }

      totalMessages += session.messages.length
    }

    const totalSessions = sessionsArray.length
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0

    return {
      totalSessions,
      activeSessions,
      archivedSessions,
      totalMessages,
      averageMessagesPerSession,
    }
  })

  // 获取最近的会话
  const getRecentSessions = useEvent((limit?: number): ChatSession[] => {
    return filterSessions({ showArchived: false })
      .slice(0, limit ?? 10)
  })

  return {
    sessions: sessionsArray,
    isLoading,
    createSession,
    appendMessage,
    appendMessages,
    replaceMessages,
    renameSession,
    archiveSession,
    restoreSession,
    deleteSession,
    clearAllSessions,
    getSession,
    filterSessions,
    getStats,
    getRecentSessions,
  }
}
