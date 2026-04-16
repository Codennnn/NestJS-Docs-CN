import { useEffect, useMemo, useRef } from 'react'

import type { HighlightResult, SnippetResult } from 'algoliasearch/lite'
import { BookOpenIcon, FileTextIcon, MapPinIcon } from 'lucide-react'

import { formatDocumentPath } from '~/lib/search-utils'
import { cn } from '~/lib/utils'
import type { AlgoliaSearchResult } from '~/types/doc'

interface SearchResultItemProps {
  result: AlgoliaSearchResult
  isSelected: boolean

  onClick: () => void
  onMouseEnter: () => void
}

function getAlgoliaRichTextValue(
  field: HighlightResult | SnippetResult | undefined,
): string | undefined {
  if (!field || Array.isArray(field) || !('value' in field)) {
    return undefined
  }

  return typeof field.value === 'string' ? field.value : undefined
}

export function SearchResultItem(props: SearchResultItemProps) {
  const { result, isSelected, onClick, onMouseEnter } = props

  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isSelected])

  // 使用 Algolia 原生高亮，回退到原始文本
  const highlightedTitle = getAlgoliaRichTextValue(result._highlightResult?.title)
    ?? result.title
    ?? '无标题'
  const highlightedTitleEn = getAlgoliaRichTextValue(result._highlightResult?.titleEn)
    ?? result.titleEn
    ?? ''
  const highlightedHeading = getAlgoliaRichTextValue(result._highlightResult?.heading)
    ?? result.heading
    ?? ''
  const highlightedContent = getAlgoliaRichTextValue(result._snippetResult?.content)
  const fallbackContent = !highlightedContent && result.content
    ? `${result.content.slice(0, 140)}${result.content.length > 140 ? '…' : ''}`
    : ''
  const showTitleEn = !!highlightedTitleEn && result.titleEn && result.titleEn !== result.title
  const showHeading = !!highlightedHeading
    && !!result.heading
    && !result.isOverview
    && result.heading !== result.title

  // 获取文档路径显示
  const documentPath = useMemo(() => {
    if (result.path) {
      return formatDocumentPath(result.path)
    }
  }, [result.path])

  // 生成文档链接
  const documentHref = result.path ?? '#'

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
        {result.isOverview
          ? (
              <BookOpenIcon className="size-4" />
            )
          : (
              <FileTextIcon className="size-4" />
            )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-1">
          <div
            className="font-medium text-sm leading-5 truncate"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />

          {showTitleEn && (
            <div
              className="text-xs text-muted-foreground truncate"
              dangerouslySetInnerHTML={{ __html: highlightedTitleEn }}
            />
          )}

          {showHeading && (
            <div
              className="text-xs text-foreground/80 truncate"
              dangerouslySetInnerHTML={{ __html: highlightedHeading }}
            />
          )}
        </div>

        {/* 内容预览 */}
        {!!highlightedContent && (
          <div
            className="text-muted-foreground text-xs leading-4 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        )}

        {!highlightedContent && !!fallbackContent && (
          <div className="text-muted-foreground text-xs leading-4 line-clamp-2">
            {fallbackContent}
          </div>
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
