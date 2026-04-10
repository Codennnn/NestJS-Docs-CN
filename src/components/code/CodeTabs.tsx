import { Children, isValidElement } from 'react'

import { consola } from 'consola'
import type { BundledLanguage } from 'shiki'

import type { CodeTabProps } from '~/components/code/CodeTab'
import { CodeTabsClient } from '~/components/code/CodeTabsClient'
import { highlightCode } from '~/components/code/transformers'

export interface CodeTabData {
  /** tab 标签文本 */
  label: string
  /** 编程语言类型 */
  lang: BundledLanguage
  /** 原始代码内容 */
  code: string
  /** 高亮后的 HTML 输出 */
  htmlOutput: string
  /** 可选的文件名 */
  filename?: string
  /** 是否显示行号 */
  showLineNumbers?: boolean
}

interface CodeTabsProps {
  /** 子组件，应该是 CodeTab 组件 */
  children: React.ReactNode
}

/**
 * CodeTabs 服务器端组件
 *
 * 负责：
 * 1. 提取所有 CodeTab 子组件的 props
 * 2. 为每个 tab 调用 highlightCode 生成高亮 HTML
 * 3. 将处理后的数据传递给客户端组件 CodeTabsClient
 */
export async function CodeTabs(props: CodeTabsProps) {
  const { children } = props

  // 提取所有 CodeTab 子组件的 props
  const tabs: CodeTabData[] = []
  const childrenArray = Children.toArray(children)

  for (const child of childrenArray) {
    // 检查是否是有效的 React 元素
    if (isValidElement<CodeTabProps>(child)) {
      const { label, lang, children: code, filename, showLineNumbers } = child.props

      // 确保 code 是字符串
      if (typeof code !== 'string') {
        consola.warn('CodeTab children must be a string')
        continue
      }

      // 为每个 tab 生成高亮 HTML
      const htmlOutput = await highlightCode({
        code,
        lang,
        showLineNumbers,
        enableTwoslash: true,
      })

      tabs.push({
        label,
        lang,
        code,
        htmlOutput,
        filename,
        showLineNumbers,
      })
    }
  }

  // 如果没有有效的 tabs，返回 null
  if (tabs.length === 0) {
    consola.warn('CodeTabs: No valid CodeTab children found')

    return null
  }

  // 将数据传递给客户端组件
  return <CodeTabsClient tabs={tabs} />
}

// 导出 CodeTab 以便在同一个文件中引入
export { CodeTab } from '~/components/code/CodeTab'
