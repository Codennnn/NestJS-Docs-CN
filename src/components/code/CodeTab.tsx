import type { BundledLanguage } from 'shiki'

/**
 * CodeTab 组件的 props 接口
 *
 * 用于定义单个代码标签页的属性
 */
export interface CodeTabProps {
  /** tab 标签文本，例如 "pnpm", "npm", "yarn" */
  label: string
  /** 编程语言类型 */
  lang: BundledLanguage
  /** 代码内容 */
  children: string
  /** 可选的文件名 */
  filename?: string
  /** 是否显示行号 */
  showLineNumbers?: boolean
}

/**
 * CodeTab 组件
 *
 * 这个组件主要用于类型定义和作为 CodeTabs 的子组件
 * 它本身不会被直接渲染，而是由 CodeTabs 组件解析其 props
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CodeTab(_props: CodeTabProps) {
  // 这个组件不会被直接渲染
  // 它的 props 会被父组件 CodeTabs 提取并处理
  return null
}
