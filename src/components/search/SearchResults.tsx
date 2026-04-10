import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useSearch } from '@oramacloud/react-client'
import { FileTextIcon, SearchIcon } from 'lucide-react'

import { Skeleton } from '~/components/ui/skeleton'
import {
  calculateRelevanceScore,
  generateCacheKey,
  highlightSearchTerm,
  SearchCache,
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

// 创建全局搜索缓存实例
const searchCache = new SearchCache(50)

export function SearchResults(props: SearchResultsProps) {
  const {
    searchTerm,
    selectedIndex,
    isComposing,
    onSelectResult,
    onResultsChange,
    onSelectedIndexChange,
  } = props

  // 使用 useDeferredValue 优化搜索体验，避免频繁请求
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // 在组合输入状态下不触发搜索，避免内容抖动
  const effectiveSearchTerm = isComposing ? '' : deferredSearchTerm

  const [loading, setLoading] = useState(false)
  const [cachedResults, setCachedResults] = useState<SearchResult[]>([])

  // 优化后的搜索配置
  const { results } = useSearch({
    term: effectiveSearchTerm,
    limit: 20, // 增加结果数量
  })

  // 处理搜索加载状态和缓存
  useEffect(() => {
    if (effectiveSearchTerm.trim()) {
      const cacheKey = generateCacheKey(effectiveSearchTerm)

      // 检查缓存
      if (searchCache.has(cacheKey)) {
        const cached = searchCache.get(cacheKey)!
        setCachedResults(cached.results)
        onResultsChange(cached.results)
        setLoading(false)

        return
      }

      setLoading(true)
      setCachedResults([])

      const timer = setTimeout(() => {
        setLoading(false)
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
    else {
      setLoading(false)
      setCachedResults([])
      onResultsChange([])
    }
  }, [effectiveSearchTerm, onResultsChange])

  // 处理搜索结果
  const hits = useMemo<SearchResult[]>(() => {
    if (!effectiveSearchTerm.trim()) {
      return []
    }

    const cacheKey = generateCacheKey(effectiveSearchTerm)

    // 如果有缓存，使用缓存
    if (cachedResults.length > 0) {
      return cachedResults
    }

    // 处理新的搜索结果
    const processedResults = (results?.hits ?? []).map((hit) => {
      const enhancedHit = {
        ...hit,
        score: hit.score || calculateRelevanceScore(hit, effectiveSearchTerm),
      } as SearchResult

      return enhancedHit
    })

    // 按相关性得分排序
    processedResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    // 缓存结果
    if (processedResults.length > 0) {
      searchCache.set(cacheKey, {
        results: processedResults,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
        query: effectiveSearchTerm,
      })
    }

    return processedResults
  }, [results, effectiveSearchTerm, cachedResults])

  // 更新父组件的结果
  useEffect(() => {
    onResultsChange(hits)
  }, [hits, onResultsChange])

  // 高亮关键词的工具函数
  const highlightText = useEvent((text: string, searchTerm: string) => {
    return highlightSearchTerm(text, searchTerm)
  })

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
          onMouseEnter={() => {
            onSelectedIndexChange(idx)
          }}
        />
      ))}
    </div>
  )
}
