import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'

interface DocLoadingSkeletonProps {
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 是否显示标题骨架屏
   * @default true
   */
  showTitle?: boolean
  /**
   * 内容行数
   * @default 4
   */
  contentLines?: number
  /**
   * 是否显示最后一行为较短的行
   * @default true
   */
  showShortLastLine?: boolean
}

/**
 * 文档加载骨架屏组件
 *
 * 用于在文档内容加载时显示占位符，提供良好的用户体验
 * 可配置标题显示、内容行数等选项
 */
export function DocLoadingSkeleton({
  className,
  showTitle = true,
  contentLines = 4,
  showShortLastLine = true,
}: DocLoadingSkeletonProps) {
  return (
    <div className={cn('flex flex-col space-y-8', className)}>
      {/* 标题骨架屏 */}
      {showTitle && (
        <Skeleton className="h-12 w-1/3" />
      )}

      {/* 内容骨架屏 */}
      <div className="space-y-4">
        {Array.from({ length: contentLines }).map((_, index) => {
          const isLastLine = index === contentLines - 1
          const shouldShowShort = showShortLastLine && isLastLine

          return (
            <Skeleton
              key={index}
              className={cn(
                'h-5',
                shouldShowShort && 'w-2/3',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
