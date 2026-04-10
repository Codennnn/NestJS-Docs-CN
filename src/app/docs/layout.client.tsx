'use client'

import { useHashNavigation } from '~/hooks/useHashNavigation'

interface DocsLayoutClientProps {
  /**
   * 文档正文容器对应的 HTML 元素 id。
   *
   * hash 导航功能会根据此 id 获取元素，并在点击锚点链接时
   * 平滑滚动至相应位置。因此，该值必须与页面中实际存在的元素 id 保持一致。
   */
  containerId: string
  children: React.ReactNode
}

export function DocsLayoutClient(props: DocsLayoutClientProps) {
  const { containerId, children } = props

  useHashNavigation({
    containerId,
    behavior: 'smooth',
    delay: 100,
  })

  return <>{children}</>
}
