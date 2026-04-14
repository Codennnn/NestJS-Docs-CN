import { useEffect, useMemo } from 'react'

import { AlertCircleIcon, FileTextIcon, SearchIcon } from 'lucide-react'

import { Skeleton } from '~/components/ui/skeleton'
import { useOramaSearch } from '~/hooks/useOramaSearch'
import {
  calculateRelevanceScore,
  highlightSearchTerm,
} from '~/lib/search-utils'
import type { SearchResult } from '~/types/doc'

import { SearchResultItem } from './SearchResultItem'

interface SearchResultsProps {
  searchTerm: string
  selectedIndex: number
  isComposing: boolean

  onSelectResult: (url: string) => void
  onResultsChange: (results: SearchResult[]) => void
  onSelectedIndexChange: (index: number) => void
}

export function SearchResults(props: SearchResultsProps) {
  const {
    searchTerm,
    selectedIndex,
    isComposing,
    onSelectResult,
    onResultsChange,
    onSelectedIndexChange,
  } = props

  // 在组合输入状态下不触发搜索，避免内容抖动
  const effectiveSearchTerm = isComposing ? '' : searchTerm

  // 使用自定义搜索 Hook
  const { results, loading, error } = useOramaSearch({
    term: effectiveSearchTerm,
    limit: 20,
  })

  // 处理搜索结果
  const hits = useMemo<SearchResult[]>(() => {
    if (!effectiveSearchTerm.trim()) {
      return []
    }

    return (results?.hits ?? [])
      .map((hit) => {
        const enhancedHit = {
          ...hit,
          score: hit.score || calculateRelevanceScore(hit, effectiveSearchTerm),
        } as SearchResult

        return enhancedHit
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }, [results, effectiveSearchTerm])

  useEffect(() => {
    if (!effectiveSearchTerm.trim()) {
      onResultsChange([])

      return
    }

    if (error) {
      onResultsChange([])

      return
    }

    onResultsChange(hits)
  }, [effectiveSearchTerm, error, hits, onResultsChange])

  useEffect(() => {
    if (selectedIndex >= hits.length) {
      onSelectedIndexChange(Math.max(0, hits.length - 1))
    }
  }, [hits.length, onSelectedIndexChange, selectedIndex])

  const highlightText = highlightSearchTerm

  if (!searchTerm.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
        <SearchIcon className="mb-4 size-12" />
        <div className="text-lg font-medium">开始搜索 NestJS 文档</div>
        <div className="text-sm mt-1">输入关键词查找相关内容</div>
      </div>
    )
  }

  if (loading) {
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

  if (hits.length === 0) {
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
      {hits.map((hit, idx) => (
        <SearchResultItem
          key={hit.id}
          highlightText={highlightText}
          isSelected={idx === selectedIndex}
          result={hit}
          searchTerm={effectiveSearchTerm}
          onClick={() => {
            if (hit.document?.path) {
              onSelectResult(hit.document.path)
            }
          }}
          onMouseEnter={() => { onSelectedIndexChange(idx) }}
        />
      ))}
    </div>
  )
}
