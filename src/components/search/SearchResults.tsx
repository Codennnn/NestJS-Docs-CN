import { useEffect } from 'react'

import { AlertCircleIcon, FileTextIcon, SearchIcon } from 'lucide-react'

import { Skeleton } from '~/components/ui/skeleton'
import { useAlgoliaSearch } from '~/hooks/useAlgoliaSearch'
import type { AlgoliaSearchResult } from '~/types/doc'

import { SearchResultItem } from './SearchResultItem'

interface SearchResultsProps {
  searchTerm: string
  queryTerm: string
  selectedIndex: number
  isComposing: boolean

  onSelectResult: (url: string) => void
  onResultsChange: (results: AlgoliaSearchResult[]) => void
  onSelectedIndexChange: (index: number) => void
}

const EMPTY_RESULTS: AlgoliaSearchResult[] = []

export function SearchResults(props: SearchResultsProps) {
  const {
    searchTerm,
    queryTerm,
    selectedIndex,
    isComposing,
    onSelectResult,
    onResultsChange,
    onSelectedIndexChange,
  } = props

  const normalizedSearchTerm = searchTerm.trim()
  const normalizedQueryTerm = queryTerm.trim()

  // 使用 Algolia 搜索 Hook
  const { results, loading, error } = useAlgoliaSearch({
    term: queryTerm,
    limit: 20,
  })
  const hits = normalizedQueryTerm ? results : EMPTY_RESULTS

  useEffect(() => {
    if (!normalizedSearchTerm) {
      onResultsChange([])

      return
    }

    if (isComposing || loading) {
      return
    }

    if (error) {
      onResultsChange([])

      return
    }

    onResultsChange(hits)
  }, [error, hits, isComposing, loading, normalizedSearchTerm, onResultsChange])

  useEffect(() => {
    if (selectedIndex >= hits.length) {
      onSelectedIndexChange(Math.max(0, hits.length - 1))
    }
  }, [hits.length, onSelectedIndexChange, selectedIndex])

  if (!normalizedSearchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <SearchIcon className="mb-4 size-12" />
        <div className="text-lg font-medium">开始搜索 NestJS 文档</div>
        <div className="text-sm mt-1">输入关键词查找相关内容</div>
      </div>
    )
  }

  if (isComposing && hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <SearchIcon className="mb-4 size-12" />
        <div className="text-lg font-medium">正在输入中文关键词</div>
        <div className="text-sm mt-1">完成输入后会自动开始搜索</div>
      </div>
    )
  }

  if (loading && hits.length === 0) {
    return (
      <div className="space-y-6 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <AlertCircleIcon className="mb-4 size-12 text-destructive/80" />
        <div className="text-lg font-medium text-foreground">搜索服务暂时不可用</div>
        <div className="text-sm mt-1 max-w-sm">
          {error.message || '请稍后重试'}
        </div>
      </div>
    )
  }

  if (!loading && !isComposing && hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <FileTextIcon className="mb-4 size-12" />
        <div className="text-lg font-medium">未找到相关内容</div>
        <div className="text-sm mt-1">
          尝试使用不同的关键词或检查拼写
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {(isComposing || loading) && (
        <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {isComposing ? '输入法组合中，完成输入后自动刷新结果' : '正在更新搜索结果...'}
        </div>
      )}

      {hits.map((hit, idx) => (
        <SearchResultItem
          key={hit.objectID}
          isSelected={idx === selectedIndex}
          result={hit}
          onClick={() => {
            if (hit.path) {
              onSelectResult(hit.path)
            }
          }}
          onMouseEnter={() => { onSelectedIndexChange(idx) }}
        />
      ))}
    </div>
  )
}
