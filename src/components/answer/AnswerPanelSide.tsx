'use client'

import dynamic from 'next/dynamic'

import { AnswerPanelSkeleton } from '~/components/answer/AnswerPanelSkeleton'
import { useAnswerPanel } from '~/hooks/useAnswerPanel'

// 创建预加载函数
export const preloadAnswerPanel = () => import('~/components/answer/AnswerPanelWithHistory')

// 使用 Next.js dynamic 懒加载 AnswerPanelWithHistory
const AnswerPanelWithHistory = dynamic(
  () => preloadAnswerPanel().then((mod) => ({ default: mod.AnswerPanelWithHistory })),
  {
    loading: () => <AnswerPanelSkeleton />,
    ssr: false, // 禁用服务端渲染，因为这是一个交互式组件
  },
)

export function AnswerPanelSide() {
  const { isOpen, close } = useAnswerPanel()

  if (isOpen) {
    return (
      <div className="sticky top-0 h-full w-96 bg-background z-50 p-4 pt-2 pl-2">
        <div className="border border-border shadow-lg size-full rounded-xl overflow-hidden">
          <AnswerPanelWithHistory
            isVisible={isOpen}
            onClose={close}
          />
        </div>
      </div>
    )
  }

  return null
}
