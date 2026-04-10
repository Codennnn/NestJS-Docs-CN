'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { ArrowUpIcon, StopCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

interface MessageInputProps {
  /**
   * 当前输入的问题
   */
  currentQuestion: string
  /**
   * 是否正在加载
   */
  isLoading: boolean
  /**
   * 是否有消息（用于显示不同的占位符）
   */
  hasMessages: boolean
  /**
   * 输入内容变化回调
   */
  onQuestionChange: (question: string) => void
  /**
   * 发送问题回调
   */
  onAskQuestion: () => void
  /**
   * 停止生成回调
   */
  onStopGeneration: () => void
}

/**
 * 消息输入组件
 *
 * 功能包括：
 * - 渲染输入框和发送/停止按钮
 * - 处理键盘事件（Enter 发送，Shift+Enter 换行）
 * - 自动聚焦输入框
 * - 根据加载状态切换按钮
 *
 * @param props 组件属性
 */
export function MessageInput(props: MessageInputProps) {
  const {
    currentQuestion,
    isLoading,
    hasMessages,
    onQuestionChange,
    onAskQuestion,
    onStopGeneration,
  } = props

  const inputRef = useRef<HTMLTextAreaElement>(null)

  /**
   * 处理键盘按下事件
   */
  const handleKeyDown = useEvent((ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      onAskQuestion()
    }
  })

  /**
   * 处理输入内容变化
   */
  const handleChange = useEvent((ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange(ev.target.value)
  })

  /**
   * 计算修剪后的问题（用于判断是否可以发送）
   */
  const trimmedQuestion = useMemo(() => {
    return currentQuestion.trim()
  }, [currentQuestion])

  /**
   * 自动聚焦输入框
   */
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isLoading])

  return (
    <div className="p-panel pt-0">
      {/* AI 问答渐变边框容器 */}
      <div className="relative p-0.5 rounded-xl bg-gradient-to-r from-theme/60 to-theme2/40">
        <div className="rounded-[12px] overflow-hidden bg-background">
          <Textarea
            ref={inputRef}
            className="!text-[13px] p-2 resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent disabled:opacity-80"
            disabled={isLoading}
            placeholder={
              hasMessages
                ? '继续提问...'
                : '输入问题开始对话，按 Enter 发送'
            }
            value={currentQuestion}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-end p-1.5 pt-0">
            {isLoading
              ? (
                  <Button
                    className="!text-xs !py-1 !px-1.5 h-auto !gap-1"
                    size="sm"
                    variant="outline"
                    onClick={onStopGeneration}
                  >
                    <StopCircleIcon className="size-3.5" />
                    停止
                  </Button>
                )
              : (
                  <Button
                    className="!text-xs !py-1 !px-1.5 h-auto !gap-1"
                    disabled={trimmedQuestion.length === 0}
                    size="sm"
                    variant="outline"
                    onClick={onAskQuestion}
                  >
                    <ArrowUpIcon className="size-3.5" />
                    发送
                  </Button>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
