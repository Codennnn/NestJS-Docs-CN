import { HistoryIcon, PanelLeftCloseIcon, SearchIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'

export function ChatHistoryPanelSkeleton() {
  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* 头部骨架 */}
      <div className="flex items-center justify-between gap-2 border-b border-border p-panel pr-panel-sm">
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-4 shrink-0" />
          <span className="text-sm font-medium">聊天历史</span>
        </div>

        <Button
          disabled
          className="size-7"
          size="icon"
          variant="ghost"
        >
          <PanelLeftCloseIcon className="size-[1em]" />
        </Button>
      </div>

      <div className="p-panel pb-0 space-y-2">
        {/* 搜索框骨架 */}
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 text-muted-foreground" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        {/* 过滤选项骨架 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      {/* 会话列表骨架 */}
      <div className="flex-1 overflow-hidden">
        <div className="p-panel space-y-1.5">
          {/* 渲染多个会话项骨架 */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-transparent bg-muted/50"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* 标题骨架 */}
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-32" />
                  </div>

                  {/* 预览和时间骨架 */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-12" />
                  </div>

                  {/* 消息统计骨架 */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                {/* 操作按钮骨架 */}
                <div className="flex items-center gap-1">
                  <Skeleton className="size-6 rounded-md" />
                  <Skeleton className="size-6 rounded-md" />
                  <Skeleton className="size-6 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
