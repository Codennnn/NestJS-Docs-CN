import { ClockIcon, SearchIcon, TrendingUpIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { SearchHistoryItem } from '~/hooks/useSearchHistory'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onSelectHistory: (term: string) => void
  onRemoveHistory?: (term: string) => void
  onClearHistory: () => void
  maxItems?: number
}

export function SearchHistory({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
  maxItems = 10,
}: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <ClockIcon className="mb-2 size-8" />
        <p className="text-sm">暂无搜索历史</p>
        <p className="text-xs mt-1">开始搜索来建立历史记录</p>
      </div>
    )
  }

  const displayHistory = history.slice(0, maxItems)

  // 格式化时间
  const formatTime = (timestamp: number) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) {
      return '刚刚'
    }

    if (minutes < 60) {
      return `${minutes} 分钟前`
    }

    if (hours < 24) {
      return `${hours} 小时前`
    }

    return `${days} 天前`
  }

  return (
    <div className="p-4 space-y-3">
      {/* 标题和清空按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ClockIcon className="size-4" />
          搜索历史
        </div>
        {history.length > 0 && (
          <Button
            className="text-xs text-muted-foreground hover:text-foreground"
            size="sm"
            variant="ghost"
            onClick={onClearHistory}
          >
            清空
          </Button>
        )}
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-2">
        {displayHistory.map((item) => (
          <div
            key={`${item.term}-${item.timestamp}`}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-theme/50 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => { onSelectHistory(item.term) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectHistory(item.term)
              }
            }}
          >
            <div className="shrink-0">
              {item.clicked
                ? (
                    <TrendingUpIcon className="size-3.5 text-success" />
                  )
                : (
                    <SearchIcon className="size-3.5 text-muted-foreground" />
                  )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm line-clamp-1">{item.term}</span>

                {/* 结果数量标识 */}
                {typeof item.resultsCount === 'number' && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {item.resultsCount} 个结果
                  </span>
                )}

                {/* 点击状态标识 */}
                {item.clicked && (
                  <span className="text-xs text-success bg-success-background px-1.5 py-0.5 rounded shrink-0">
                    已访问
                  </span>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-0.5">
                {formatTime(item.timestamp)}
                {item.category && (
                  <span className="ml-2">• {item.category}</span>
                )}
              </div>
            </div>

            {/* 删除按钮 */}
            {onRemoveHistory && (
              <Button
                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveHistory(item.term)
                }}
              >
                <XIcon className="size-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* 显示更多历史记录提示 */}
      {history.length > maxItems && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          还有 {history.length - maxItems} 条历史记录
        </div>
      )}

      {/* 搜索统计信息 */}
      {history.length > 5 && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg mt-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="font-medium text-foreground">
                {history.filter((item) => item.resultsCount && item.resultsCount > 0).length}
              </div>
              <div>成功搜索</div>
            </div>
            <div>
              <div className="font-medium text-foreground">
                {history.filter((item) => item.clicked).length}
              </div>
              <div>已访问</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
