'use client'

import { useState } from 'react'

import { CodeContainer } from '~/components/code/CodeContainer'
import type { CodeTabData } from '~/components/code/CodeTabs'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface CodeTabsClientProps {
  /** 所有 tab 的数据 */
  tabs: CodeTabData[]
}

/**
 * CodeTabs 客户端组件
 *
 * 负责：
 * 1. 管理当前激活的 tab 状态
 * 2. 渲染 tab 按钮列表
 * 3. 使用 CodeContainer 展示当前激活的代码
 */
export function CodeTabsClient(props: CodeTabsClientProps) {
  const { tabs } = props

  // 管理当前激活的 tab 索引
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // 获取当前激活的 tab 数据
  const currentTab = tabs[activeTabIndex]

  const tabButtons = (
    <div className="flex items-center gap-code-block">
      {tabs.map((tab, index) => (
        <Button
          key={index}
          className={cn(
            'h-6 !px-2 text-xs font-medium rounded',
            'hover:bg-secondary',
            index === activeTabIndex
              ? 'bg-secondary text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => {
            setActiveTabIndex(index)
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )

  return (
    <CodeContainer
      code={currentTab.code}
      filename={currentTab.filename}
      headerContent={tabButtons}
      lang={currentTab.lang}
    >
      <div
        dangerouslySetInnerHTML={{ __html: currentTab.htmlOutput }}
      />
    </CodeContainer>
  )
}
