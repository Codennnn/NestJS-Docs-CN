import { useEffect, useMemo, useRef } from 'react'

import { BookOpenIcon, FileTextIcon, MapPinIcon } from 'lucide-react'

import { formatDocumentPath } from '~/lib/search-utils'
import { cn } from '~/lib/utils'
import type { SearchResult } from '~/types/doc'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  searchTerm: string

  highlightText: (text: string, searchTerm: string) => string
  onClick: () => void
  onMouseEnter: () => void
}

export function SearchResultItem(props: SearchResultItemProps) {
  const { result, isSelected, searchTerm, highlightText, onClick, onMouseEnter } = props

  const { document } = result

  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isSelected])

  // 获取高亮显示的标题
  const getHighlightedTitle = () => {
    const title = document?.title ?? document?.heading ?? '无标题'

    return highlightText(title, searchTerm)
  }

  // 获取高亮显示的内容
  const getHighlightedContent = () => {
    if (!document?.content) {
      return ''
    }

    return highlightText(document.content, searchTerm)
  }

  // 获取文档路径显示
  const documentPath = useMemo(() => {
    if (document?.path) {
      return formatDocumentPath(document.path)
    }
  }, [document])

  // 生成文档链接
  const documentHref = useMemo(() => {
    if (document?.path) {
      return document.path
    }

    return '#'
  }, [document])

  /**
   * 处理点击事件
   * 对于左键点击，使用原有的 onClick 回调
   * 对于中键点击，浏览器会自动在新标签页打开链接
   */
  const handleClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    // 阻止事件冒泡，避免影响 Dialog 的点击检测
    ev.stopPropagation()

    // 如果是左键点击（button 0），阻止默认行为并使用自定义逻辑
    if (ev.button === 0 && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault()
      onClick()
    }
    // 对于中键点击（button 1）或 Ctrl/Cmd + 左键，让浏览器处理默认行为
  }

  /**
   * 处理鼠标悬停事件
   */
  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.stopPropagation()

    onMouseEnter()
  }

  return (
    <a
      ref={ref}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-150 hover:bg-muted/50 no-underline',
        isSelected && 'bg-muted hover:bg-muted border-accent-foreground/20 shadow-sm',
      )}
      href={documentHref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        {document?.section
          ? (
              <FileTextIcon className="size-4" />
            )
          : (
              <BookOpenIcon className="size-4" />
            )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div
          className="font-medium text-sm leading-5 truncate"
          dangerouslySetInnerHTML={{ __html: getHighlightedTitle() }}
        />

        {/* 内容预览 */}
        {!!document?.content && (
          <div
            className="text-muted-foreground text-xs leading-4 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
          />
        )}

        {/* 文档路径 */}
        {!!documentPath && (
          <div className="text-xs text-muted-foreground/80 line-clamp-1 flex items-center gap-1">
            <MapPinIcon className="size-[1em]" />
            {documentPath}
          </div>
        )}
      </div>
    </a>
  )
}
