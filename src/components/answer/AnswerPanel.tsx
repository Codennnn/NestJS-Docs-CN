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
    if (currentSessionId) {
      const restoredMessages = restoreSessionMessages(currentSessionId)
      // 设置初始消息并重新初始化 Orama 会话
      setInitialMessages(restoredMessages)
    }
  }, [currentSessionId, restoreSessionMessages, setInitialMessages])

  // 自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      smartScrollToBottom()
    }
  }, [messages, smartScrollToBottom])

  // 保存新消息到当前会话
  useEffect(() => {
    saveMessages(messages)
  }, [messages, saveMessages])

  // 当加载状态变化时也滚动到底部，确保用户能看到加载状态
  useEffect(() => {
    if (isLoading) {
      smartScrollToBottom()
    }
  }, [isLoading, smartScrollToBottom])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  useEffect(() => {
    onAbortRefReady?.(abortAnswer)
  }, [abortAnswer, onAbortRefReady])

  const handleAskQuestion = useEvent(() => {
    const trimmedQuestion = currentQuestion.trim()

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

  const handleRelatedQuestionClick = useEvent((query: string) => {
    setCurrentQuestion(query)

    // 设置问题后立即滚动，让用户看到问题被填入
    resetScrollState()

    // 等待状态更新后再发送问题
    setTimeout(() => {
      handleAskQuestion()
    }, 0)
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
