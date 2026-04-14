import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'nextjs-toploader/app'
import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon, SearchIcon, XIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Kbd } from '~/components/ui/kbd'
import { useSearchHistory } from '~/hooks/useSearchHistory'
import type { SearchResult } from '~/types/doc'

import { SearchResults } from './SearchResults'

interface SearchDialogContentProps {
  onClose: () => void
}

export function SearchDialogContent({ onClose }: SearchDialogContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const resultCount = searchResults.length

  const [isComposing, setIsComposing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const { addToHistory, markAsClicked } = useSearchHistory()

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleInputChange = useEvent((ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value
    setSearchTerm(value)

    // 只有在非输入法组合状态下才触发搜索
    if (!isComposing) {
      setSelectedIndex(0)
    }
  })

  const handleCompositionStart = useEvent(() => {
    setIsComposing(true)
  })

  const handleCompositionEnd = useEvent(() => {
    setIsComposing(false)
    setSelectedIndex(0)
  })

  const handleSelectResult = useEvent((url: string) => {
    // 处理不同类型的 URL
    if (!url) {
      return
    }

    // 标记搜索词为已点击
    if (searchTerm.trim()) {
      markAsClicked(searchTerm.trim())
    }

    let urlObj: URL | null = null

    try {
      // 尝试解析为完整 URL
      urlObj = new URL(url, window.location.origin)
    }
    catch {
      console.error('Invalid URL:', url)
    }

    if (urlObj) {
      if (urlObj.origin !== window.location.origin) {
        onClose()
        window.open(urlObj.toString(), '_blank', 'noopener,noreferrer')
      }
      else {
        onClose()
        router.push(urlObj.toString())
      }
    }
  })

  // 处理搜索结果变化，更新历史记录
  const handleResultsChange = useEvent((results: SearchResult[]) => {
    setSearchResults(results)

    // 当有搜索词且有结果时，添加到历史记录
    if (searchTerm.trim() && results.length > 0) {
      addToHistory(searchTerm.trim(), results.length)
    }
  })

  const handleKeyDown = useEvent((ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Escape') {
      onClose()
    }
    else if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setSelectedIndex((prev) => Math.min(resultCount - 1, prev + 1))
    }
    else if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    }
    else if (ev.key === 'Enter' && resultCount > 0 && searchResults.length > 0) {
      ev.preventDefault()
      // 触发选中项的点击事件
      const selectedResult = searchResults[selectedIndex]

      if (selectedResult.document?.path) {
        handleSelectResult(selectedResult.document.path)
      }
    }
  })

  const handleClearSearch = useEvent(() => {
    setSearchTerm('')
    setSelectedIndex(0)
    setSearchResults([])

    inputRef.current?.focus()
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DialogHeader className="border-b border-border p-0">
        <DialogTitle>
          <div className="relative flex items-center gap-3 px-3 h-12">
            <SearchIcon className="size-4 shrink-0" />

            <input
              ref={inputRef}
              className="flex-1 h-full outline-none! font-normal text-sm border-none! shadow-none focus-visible:outline-none placeholder:text-muted-foreground"
              placeholder="搜索 NestJS 文档..."
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onCompositionEnd={handleCompositionEnd}
              onCompositionStart={handleCompositionStart}
              onKeyDown={handleKeyDown}
            />

            {!!searchTerm && (
              <Button
                className="size-7"
                size="icon"
                variant="ghost"
                onClick={() => {
                  handleClearSearch()
                }}
              >
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
        </DialogTitle>

        <DialogDescription className="sr-only">
          搜索 NestJS 中文文档内容，使用上下箭头键导航结果，回车键选择，ESC 键关闭
        </DialogDescription>
      </DialogHeader>

      <ScrollGradientContainer>
        <SearchResults
          isComposing={isComposing}
          searchTerm={searchTerm}
          selectedIndex={selectedIndex}
          onResultsChange={handleResultsChange}
          onSelectedIndexChange={setSelectedIndex}
          onSelectResult={handleSelectResult}
        />
      </ScrollGradientContainer>

      <div className="border-t border-border p-3 bg-muted/40">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Kbd>
              <ArrowUpIcon className="size-3" />
            </Kbd>
            <Kbd>
              <ArrowDownIcon className="size-3" />
            </Kbd>
            <span>导航</span>
          </div>

          <div className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeftIcon className="size-3" />
            </Kbd>
            <span>选择</span>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Kbd>
              <span>Esc</span>
            </Kbd>
            <span>关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}
