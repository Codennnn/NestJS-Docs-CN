import { Skeleton } from '~/components/ui/skeleton'

export function AnswerPanelSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* 头部骨架 */}
      <div className="flex items-center justify-between p-panel border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-18" />
        </div>
        <Skeleton className="size-6" />
      </div>

      {/* 内容区域骨架 */}
      <div className="flex flex-col justify-center flex-1 p-4 gap-5">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="size-12 rounded-full" />

          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="space-y-2.5">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      </div>

      {/* 输入区域骨架 */}
      <div className="p-4">
        <Skeleton className="h-20" />
      </div>
    </div>
  )
}
