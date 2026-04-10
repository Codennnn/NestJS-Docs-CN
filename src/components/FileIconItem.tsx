import { cn } from '~/lib/utils'

import { LanguageIcon } from './LanguageIcon'

/**
 * FileIconItem 组件的 Props 接口
 *
 * 用于定义文件图标项的属性
 */
export interface FileIconItemProps {
  /** 文件名称，用于显示和图标匹配 */
  filename?: string
  /** 编程语言类型 */
  lang: string
  /** 显示的文本，默认使用 filename 或 lang */
  label?: string
  /** 自定义类名 */
  className?: string
  /** 图标类名 */
  iconClassName?: string
  /** 文本类名 */
  textClassName?: string
}

/**
 * 文件图标项组件
 *
 * 用于显示带有图标的文件或语言类型项
 * 可用于文件列表、语言选择器等场景
 *
 * @param props 组件属性
 */
export function FileIconItem(props: FileIconItemProps) {
  const {
    filename,
    lang,
    label,
    className,
    iconClassName = 'size-5',
    textClassName = 'text-sm font-mono',
  } = props

  // 确定显示的文本：优先使用传入的 label，其次是 filename，最后是 lang
  const displayText = label || filename || lang

  return (
    <div className={cn('flex items-center gap-2 p-2 bg-muted/50 rounded', className)}>
      <LanguageIcon
        className={cn('shrink-0', iconClassName)}
        filename={filename}
        lang={lang}
      />
      <span className={cn('truncate', textClassName)}>{displayText}</span>
    </div>
  )
}
