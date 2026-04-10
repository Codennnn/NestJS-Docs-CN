'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import {
  ArchiveIcon,
  CheckIcon,
  EditIcon,
  HistoryIcon,
  PanelLeftCloseIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useChatSessions } from '~/hooks/useChatSessions'
import type { ChatSession } from '~/types/chat'

interface ChatHistoryPanelProps {
  isVisible?: boolean
  onSessionSelect?: (session: ChatSession) => void
  currentSessionId?: string | null
  onClose?: () => void
  /** 当会话被删除时的回调，用于通知父组件处理当前会话状态 */
  onSessionDelete?: (sessionId: string) => void
}

export function ChatHistoryPanel(props: ChatHistoryPanelProps) {
  const { isVisible = true, onSessionSelect, currentSessionId, onClose, onSessionDelete } = props

  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null)

  const {
    filterSessions,
    renameSession,
    archiveSession,
    restoreSession,
    deleteSession,
  } = useChatSessions()

  const filteredSessions = filterSessions({
    searchTerm,
    showArchived,
  })

  const handleEditStart = useEvent((session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  })

  const handleEditSave = useEvent(() => {
    if (editingSessionId && editingTitle.trim()) {
      renameSession(editingSessionId, editingTitle.trim())
    }

    setEditingSessionId(null)
    setEditingTitle('')
  })

  const handleEditCancel = useEvent(() => {
    setEditingSessionId(null)
    setEditingTitle('')
  })

  const handleDeleteClick = useEvent((session: ChatSession) => {
    setSessionToDelete(session)
  })

  const handleDeleteConfirm = useEvent(() => {
    if (!sessionToDelete) {
      return
    }

    // 删除会话
    deleteSession(sessionToDelete.id)

    // 如果删除的是当前选中的会话,通知父组件
    if (sessionToDelete.id === currentSessionId) {
      onSessionDelete?.(sessionToDelete.id)
    }

    // 关闭对话框
    setSessionToDelete(null)
  })

  const handleDeleteCancel = useEvent(() => {
    setSessionToDelete(null)
  })

  const formatDate = useEvent((timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    else if (diffDays === 1) {
      return '昨天'
    }
    else if (diffDays < 7) {
      return `${diffDays} 天前`
    }
    else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }
  })

  const getMessagePreview = useEvent((session: ChatSession) => {
    if (session.messages.length === 0) {
      return '暂无消息'
    }

    const lastMessage = session.messages[session.messages.length - 1]
    const content = lastMessage.content.trim()

    if (content.length <= 50) {
      return content
    }

    return `${content.substring(0, 50)}...`
  })

  if (!isVisible) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* 头部 */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-panel pr-panel-sm">
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-4 shrink-0" />
          <span className="text-sm font-medium">聊天历史</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="size-7"
              size="icon"
              variant="ghost"
              onClick={() => onClose?.()}
            >
              <PanelLeftCloseIcon className="size-[1em]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            关闭
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="p-panel pb-0 space-y-2">
        {/* 搜索框 */}
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            className="pl-7 text-xs h-8"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value) }}
          />
        </div>

        {/* 过滤选项 */}
        <div className="flex items-center gap-2">
          <Button
            className="text-xs h-6"
            size="sm"
            variant={showArchived
              ? 'default'
              : 'outline'}
            onClick={() => { setShowArchived(!showArchived) }}
          >
            {showArchived
              ? '显示全部'
              : '显示归档'}
          </Button>
        </div>
      </div>

      {/* 会话列表 */}
      <ScrollGradientContainer className="flex-1">
        {filteredSessions.length === 0
          ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {
                  searchTerm
                    ? '未找到匹配的对话'
                    : '暂无对话历史'
                }
              </div>
            )
          : (
              <div className="p-panel space-y-1.5">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                  group p-3 rounded-lg border transition-colors cursor-pointer
                  ${currentSessionId === session.id
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-muted/50 border-transparent hover:bg-muted'
                  }
                  ${session.archived
                    ? 'opacity-60'
                    : ''}
                `}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!session.archived) {
                        onSessionSelect?.(session)
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !session.archived) {
                        e.preventDefault()
                        onSessionSelect?.(session)
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        {/* 标题 */}
                        {editingSessionId === session.id
                          ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  className="text-xs h-6 flex-1"
                                  value={editingTitle}
                                  onChange={(e) => { setEditingTitle(e.target.value) }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditSave()
                                    }
                                    else if (e.key === 'Escape') {
                                      handleEditCancel()
                                    }
                                  }}
                                />
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditSave()
                                  }}
                                >
                                  <CheckIcon className="size-3" />
                                </Button>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditCancel()
                                  }}
                                >
                                  <XIcon className="size-3" />
                                </Button>
                              </div>
                            )
                          : (
                              <h3 className="text-sm font-medium truncate">
                                {session.title}
                              </h3>
                            )}

                        {/* 预览和时间 */}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {getMessagePreview(session)}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>

                        {/* 消息统计 */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {session.messages.length} 条消息
                          </span>
                          {session.archived && (
                            <span className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                              已归档
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!session.archived && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditStart(session)
                                  }}
                                >
                                  <EditIcon className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                重命名
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    archiveSession(session.id)
                                  }}
                                >
                                  <ArchiveIcon className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                归档
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(session)
                                  }}
                                >
                                  <Trash2Icon className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                删除
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {session.archived && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    restoreSession(session.id)
                                  }}
                                >
                                  <ArchiveIcon className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                恢复
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="size-6"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSession(session.id)
                                  }}
                                >
                                  <Trash2Icon className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                永久删除
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </ScrollGradientContainer>

      {/* 删除确认对话框 */}
      <Dialog
        open={!!sessionToDelete}
        onOpenChange={(open) => {
          if (!open) {
            handleDeleteCancel()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除对话</DialogTitle>
            <DialogDescription>
              确定要删除这个对话吗?此操作无法撤销。
            </DialogDescription>
          </DialogHeader>

          {sessionToDelete && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">标题：</span>
                  <span className="font-medium">{sessionToDelete.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">消息数量：</span>
                  <span className="font-medium">{sessionToDelete.messages.length} 条</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
