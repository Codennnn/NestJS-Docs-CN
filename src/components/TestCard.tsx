import Link from 'next/link'

import { Button } from '~/components/ui/button'

interface TestCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片描述文本 */
  description: string
  /** 链接地址 */
  href: string
  /** 是否有独立的测试页面 */
  hasTestPage?: boolean
  /** 按钮文本，默认为 "查看测试" */
  buttonText?: string
  /** 子元素，用于自定义卡片内容 */
  children?: React.ReactNode
}

/**
 * 测试卡片组件
 * 用于在测试页面展示各种测试功能的入口卡片
 *
 * @param props - TestCard 组件的属性
 * @returns 测试卡片组件
 */
export function TestCard(props: TestCardProps) {
  const {
    title,
    description,
    href,
    buttonText = '查看测试',
    hasTestPage = true,
    children,
  } = props

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>

      <p className="text-sm text-muted-foreground">{description}</p>

      {children}

      {hasTestPage && (
        <Link href={href}>
          <Button className="w-full" variant="outline">
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  )
}
