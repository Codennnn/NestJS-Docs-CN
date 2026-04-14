'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type { AnswerSession, Interaction } from '@orama/core'

import { getOramaClient } from '~/lib/orama'
import type { ChatMessage } from '~/types/chat'

const DEFAULT_OPTIONS: UseAnswerSessionOptions = {}

interface UseAnswerSessionOptions {
  /**
   * 加载状态变化回调
   */
  onLoadingChange?: (loading: boolean) => void
}

interface UseAnswerSessionReturn {
  /**
   * Orama 答案会话实例
   */
  answerSession: AnswerSession | null
  /**
   * 当前交互列表
   */
  interactions: Interaction[]
  /**
   * 当前消息列表
   */
  messages: ChatMessage[]
  /**
   * 是否正在加载
   */
  isLoading: boolean
  /**
   * 发送问题
   */
  askQuestion: (question: string) => Promise<void>
  /**
   * 中止当前回答生成
   */
  abortAnswer: () => void
  /**
   * 设置初始消息（用于会话切换时）
   */
  setInitialMessages: (messages: ChatMessage[]) => void
}

/**
 * 管理 Orama 答案会话的自定义 Hook
 *
 * 功能包括：
 * - 初始化 Orama 客户端和答案会话
 * - 处理消息状态变化和交互
 * - 管理加载状态
 * - 提供发送问题和中止回答的方法
 *
 * @param options 配置选项
 * @returns 会话状态和控制方法
 */
export function useAnswerSession(
  options: UseAnswerSessionOptions = DEFAULT_OPTIONS,
): UseAnswerSessionReturn {
  const {
    onLoadingChange,
  } = options

  const [answerSession, setAnswerSession] = useState<AnswerSession | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const answerSessionRef = useRef<AnswerSession | null>(null)
  const isLoadingRef = useRef(false)
  const initialMessagesRef = useRef<ChatMessage[]>([])
  const sessionVersionRef = useRef(0)
  const messageTimestampRef = useRef(new Map<string, number>())

  const updateLoadingState = useEvent((loading: boolean) => {
    if (isLoadingRef.current !== loading) {
      isLoadingRef.current = loading
      setIsLoading(loading)
      onLoadingChange?.(loading)
    }
  })

  const resetMessageTimestamps = useEvent((seedMessages: ChatMessage[]) => {
    const timestamps = new Map<string, number>()

    seedMessages.forEach((message) => {
      if (!message.interactionId) {
        return
      }

      timestamps.set(
        `${message.role}:${message.interactionId}`,
        message.timestamp ?? Date.now(),
      )
    })

    messageTimestampRef.current = timestamps
  })

  const getStableTimestamp = useEvent((role: ChatMessage['role'], interactionId: string) => {
    const key = `${role}:${interactionId}`
    const existingTimestamp = messageTimestampRef.current.get(key)

    if (existingTimestamp) {
      return existingTimestamp
    }

    const createdAt = Date.now()
    messageTimestampRef.current.set(key, createdAt)

    return createdAt
  })

  const buildMessagesFromInteractions = useEvent(
    (currentInteractions: Interaction[]): ChatMessage[] => {
      const interactionMessages = currentInteractions.flatMap((interaction) => {
        const nextMessages: ChatMessage[] = []

        if (interaction.query) {
          nextMessages.push({
            role: 'user',
            content: interaction.query,
            timestamp: getStableTimestamp('user', interaction.id),
            interactionId: interaction.id,
          })
        }

        if (interaction.response || interaction.error || interaction.aborted) {
          nextMessages.push({
            role: 'assistant',
            content: interaction.response,
            timestamp: getStableTimestamp('assistant', interaction.id),
            interactionId: interaction.id,
          })
        }

        return nextMessages
      })

      return [...initialMessagesRef.current, ...interactionMessages]
    },
  )

  /**
   * 初始化 Orama 答案会话
   */
  const initializeAnswerSession = useEvent(
    (seedMessages: ChatMessage[] = initialMessagesRef.current) => {
      const currentVersion = ++sessionVersionRef.current

      try {
        const orama = getOramaClient()

        const session = orama.ai.createAISession({
          initialMessages: seedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          events: {
            onStateChange: (state) => {
              if (currentVersion !== sessionVersionRef.current) {
                return
              }

              const currentInteractions = Array.isArray(state) ? state : []
              setInteractions(currentInteractions)

              // 从最新交互推导加载状态
              const latestInteraction = currentInteractions.at(-1)
              const currentlyLoading = latestInteraction?.loading ?? false
              updateLoadingState(currentlyLoading)

              setMessages(buildMessagesFromInteractions(currentInteractions))
            },
          },
        })

        answerSessionRef.current = session
        setAnswerSession(session)
        setInteractions([])
        setMessages(seedMessages)

        return session
      }
      catch (error) {
        console.error('初始化答案会话失败：', error)

        return null
      }
    },
  )

  /**
   * 发送问题到 Orama 会话
   */
  const askQuestion = useEvent(async (question: string) => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    const session = answerSessionRef.current ?? initializeAnswerSession()

    if (!session) {
      return
    }

    updateLoadingState(true)

    try {
      await session.answer({
        query: trimmedQuestion,
        related: {
          enabled: true,
          size: 3,
          format: 'question',
        },
      })
    }
    catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('问答失败：', error)
      }

      updateLoadingState(false)
    }
  })

  /**
   * 中止当前回答生成
   */
  const abortAnswer = useEvent(() => {
    if (answerSessionRef.current && isLoadingRef.current) {
      try {
        answerSessionRef.current.abort()
        updateLoadingState(false)
      }
      catch (error) {
        console.error('终止回答失败：', error)
      }
    }
  })

  /**
   * 设置初始消息并重新初始化会话
   */
  const handleSetInitialMessages = useEvent((newMessages: ChatMessage[]) => {
    try {
      answerSessionRef.current?.abort()
    }
    catch {
      // 会话未处于活跃请求时 abort 会抛错，这里忽略即可
    }

    initialMessagesRef.current = newMessages
    resetMessageTimestamps(newMessages)
    setInteractions([])
    setMessages(newMessages)
    answerSessionRef.current = null
    setAnswerSession(null)
    updateLoadingState(false)
    initializeAnswerSession(newMessages)
  })

  // 初始化会话
  useEffect(() => {
    if (!answerSessionRef.current) {
      initializeAnswerSession()
    }
  }, [initializeAnswerSession])

  return {
    answerSession,
    interactions,
    messages,
    isLoading,
    askQuestion,
    abortAnswer,
    setInitialMessages: handleSetInitialMessages,
  }
}
