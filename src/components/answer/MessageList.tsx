'use client'

import type { Interaction } from '@oramacloud/client'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import type { ChatMessage } from '~/types/chat'

import { AssistantMessage } from './AssistantMessage'
import { EmptyState } from './EmptyState'
import { LoadingMessage } from './LoadingMessage'
import { UserMessage } from './UserMessage'

interface MessageListProps {
  /**
   * 消息列表
   */
  messages: ChatMessage[]
  /**
   * 交互列表（用于获取助手消息的相关信息）
   */
  interactions: Interaction[]
  /**
   * 是否正在加载
   */
  isLoading: boolean
  /**
   * 滚动容器的 ref
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  /**
   * 消息末尾的 ref（用于滚动定位）
   */
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  /**
   * 滚动事件处理函数
   */
  onScroll: () => void
  /**
   * 相关问题点击回调
   */
  onRelatedQuestionClick: (query: string) => void
}

/**
 * 消息列表组件
 *
 * 功能包括：
 * - 渲染用户消息和助手消息
 * - 显示加载状态
 * - 显示空状态
 * - 处理滚动事件
 * - 支持相关问题点击
 *
 * @param props 组件属性
 */
export function MessageList(props: MessageListProps) {
  const {
    messages,
    interactions,
    isLoading,
    scrollContainerRef,
    messagesEndRef,
    onScroll,
    onRelatedQuestionClick,
  } = props

  return (
    <ScrollGradientContainer
      ref={scrollContainerRef}
      onScroll={onScroll}
    >
      {messages.length === 0
        ? (
            <EmptyState
              onQuestionClick={onRelatedQuestionClick}
            />
          )
        : (
            <div className="p-panel space-y-panel">
              {messages.map((message, idx) => {
                if (message.role === 'user') {
                  return (
                    <UserMessage
                      key={`${message.interactionId}-${idx}`}
                      content={message.content}
                    />
                  )
                }

                // 助手消息
                const currentInteraction = interactions[Math.floor(idx / 2)]

                return (
                  <AssistantMessage
                    key={`${message.interactionId}-${idx}`}
                    content={message.content}
                    interaction={currentInteraction}
                    onRelatedQuestionClick={onRelatedQuestionClick}
                  />
                )
              })}

              {isLoading && (
                <LoadingMessage />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
    </ScrollGradientContainer>
  )
}
