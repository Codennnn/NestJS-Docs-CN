'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useAnswerSession } from '~/hooks/useAnswerSession'
import { useMessagePersistence } from '~/hooks/useMessagePersistence'
import { useScrollControl } from '~/hooks/useScrollControl'

import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface AnswerPanelProps {
  sessionId?: string | null
  onSessionChange?: (sessionId: string) => void
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'error' | 'idle') => void
  onLoadingChange?: (isLoading: boolean) => void
  onAbortRefReady?: (abortFn: () => void) => void
}

export function AnswerPanel(props: AnswerPanelProps) {
  const {
    sessionId,
    onSessionChange,
    onSaveStatusChange,
    onLoadingChange,
    onAbortRefReady,
  } = props

  const [currentQuestion, setCurrentQuestion] = useState('')

  const {
    currentSessionId,
    saveMessages,
    restoreSessionMessages,
    ensureSession,
  } = useMessagePersistence({
    sessionId,
    onSessionChange,
    onSaveStatusChange,
  })

  const {
    interactions,
    messages,
    isLoading,
    askQuestion,
    abortAnswer,
    setInitialMessages,
  } = useAnswerSession()

  const {
    scrollContainerRef,
    messagesEndRef,
    smartScrollToBottom,
    handleScroll,
    resetScrollState,
  } = useScrollControl()

  // 当会话切换时恢复对话历史
  useEffect(() => {
    const restoredMessages = currentSessionId
      ? restoreSessionMessages(currentSessionId)
      : []

    // 设置初始消息并重新初始化 Orama 会话
    setInitialMessages(restoredMessages)
  }, [currentSessionId, restoreSessionMessages, setInitialMessages])

  // 自动滚动到底部：消息变化或加载开始时触发
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      smartScrollToBottom()
    }
  }, [messages, isLoading, smartScrollToBottom])

  // 保存新消息到当前会话
  useEffect(() => {
    saveMessages(messages)
  }, [messages, saveMessages])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  useEffect(() => {
    onAbortRefReady?.(abortAnswer)
  }, [abortAnswer, onAbortRefReady])

  const submitQuestion = useEvent((question: string) => {
    const trimmedQuestion = question.trim()

    if (trimmedQuestion.length === 0 || isLoading) {
      return
    }

    // 确保会话存在（延迟创建：只在用户真正发送消息时才创建会话）
    ensureSession()

    setCurrentQuestion('')

    // 用户发送问题后强制滚动到底部（重置用户滚动状态）
    resetScrollState()

    void askQuestion(trimmedQuestion)
  })

  const handleAskQuestion = useEvent(() => {
    submitQuestion(currentQuestion)
  })

  const handleRelatedQuestionClick = useEvent((query: string) => {
    submitQuestion(query)
  })

  const handleStopGeneration = useEvent(() => {
    abortAnswer()
  })

  return (
    <div className="h-full flex flex-col">
      {/* 消息区域 */}
      <MessageList
        interactions={interactions}
        isLoading={isLoading}
        messages={messages}
        messagesEndRef={messagesEndRef}
        scrollContainerRef={scrollContainerRef}
        onRelatedQuestionClick={handleRelatedQuestionClick}
        onScroll={handleScroll}
      />

      {/* 输入区域 */}
      <MessageInput
        currentQuestion={currentQuestion}
        hasMessages={messages.length > 0}
        isLoading={isLoading}
        onAskQuestion={handleAskQuestion}
        onQuestionChange={setCurrentQuestion}
        onStopGeneration={handleStopGeneration}
      />
    </div>
  )
}
