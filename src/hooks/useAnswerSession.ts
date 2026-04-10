'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type AnswerSession, type Interaction, OramaClient } from '@oramacloud/client'

import type { ChatMessage } from '~/types/chat'

const USER_CONTEXT = '用户正在浏览 NestJS 中文文档网站，希望获得关于 NestJS 框架的准确和详细的答案。请用中文回答问题，并保持对话的连续性和上下文理解。'

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
  answerSession: AnswerSession<boolean> | null
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
export function useAnswerSession(options: UseAnswerSessionOptions = {}): UseAnswerSessionReturn {
  const {
    onLoadingChange,
  } = options

  const [answerSession, setAnswerSession] = useState<AnswerSession<boolean> | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const answerSessionRef = useRef(answerSession)
  const isLoadingRef = useRef(false)
  const initialMessagesRef = useRef<ChatMessage[]>([])

  /**
   * 初始化 Orama 答案会话
   */
  const initializeAnswerSession = useEvent(() => {
    try {
      const orama = new OramaClient({
        endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!,
        api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY!,
      })

      const session = orama.createAnswerSession({
        userContext: USER_CONTEXT,
        inferenceType: 'documentation',
        initialMessages: initialMessagesRef.current.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        events: {
          onStateChange: (state) => {
            const interactions = Array.isArray(state) ? state as Interaction[] : []
            setInteractions(interactions)

            // 将交互转换为消息格式
            const allMessages = interactions.reduce<ChatMessage[]>((messages, interaction) => {
              if (interaction.query) {
                messages.push({
                  role: 'user',
                  content: interaction.query,
                  timestamp: Date.now(),
                  interactionId: interaction.interactionId,
                })
              }

              if (interaction.response) {
                messages.push({
                  role: 'assistant',
                  content: interaction.response,
                  timestamp: Date.now(),
                  interactionId: interaction.interactionId,
                })
              }

              return messages
            }, [])

            setMessages(allMessages)
          },

          onMessageLoading: (loading: boolean) => {
            isLoadingRef.current = loading
            setIsLoading(loading)
            onLoadingChange?.(loading)
          },

          onAnswerAborted: (aborted: boolean) => {
            if (aborted) {
              isLoadingRef.current = false
              setIsLoading(false)
            }
          },
        },
      })

      answerSessionRef.current = session
      setAnswerSession(session)
    }
    catch (error) {
      console.error('初始化答案会话失败：', error)
    }
  })

  /**
   * 发送问题到 Orama 会话
   */
  const askQuestion = useEvent(async (question: string) => {
    if (!answerSessionRef.current || !question.trim()) {
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)

    try {
      await answerSessionRef.current.ask({
        term: question.trim(),
        related: {
          howMany: 3,
          format: 'question',
        },
      })
    }
    catch (error) {
      console.error('问答失败：', error)
      isLoadingRef.current = false
      setIsLoading(false)
    }
  })

  /**
   * 中止当前回答生成
   */
  const abortAnswer = useEvent(() => {
    if (answerSessionRef.current && isLoadingRef.current) {
      try {
        answerSessionRef.current.abortAnswer()
        isLoadingRef.current = false
        setIsLoading(false)
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
    initialMessagesRef.current = newMessages
    answerSessionRef.current = null
    setAnswerSession(null)
    setInteractions([])
    setMessages([])
    isLoadingRef.current = false
    setIsLoading(false)
  })

  // 初始化会话
  useEffect(() => {
    if (!answerSession) {
      initializeAnswerSession()
    }
  }, [answerSession, initializeAnswerSession])

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
