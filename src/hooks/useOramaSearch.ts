'use client'

import { useEffect, useRef, useState } from 'react'

import type { SearchResult as OramaSearchResult } from '@orama/core'

import { getOramaClient } from '~/lib/orama'
import type { SearchDocument } from '~/types/doc'

interface UseOramaSearchParams {
  /**
   * 搜索关键词
   */
  term: string
  /**
   * 返回结果数量上限
   */
  limit?: number
}

interface UseOramaSearchReturn {
  /**
   * 搜索结果
   */
  results: OramaSearchResult<SearchDocument> | null
  /**
   * 是否正在搜索
   */
  loading: boolean
  /**
   * 错误状态
   */
  error: Error | null
}

const SEARCH_DEBOUNCE_MS = 180
const SEARCH_CACHE_LIMIT = 50
const LATIN_CHAR_REGEX = /[a-z]/i

const searchCache = new Map<string, OramaSearchResult<SearchDocument>>()

function getSearchCacheKey(term: string, limit: number): string {
  return `${term.trim().toLowerCase()}::${limit}`
}

function setCachedResult(
  key: string,
  value: OramaSearchResult<SearchDocument>,
): void {
  if (searchCache.has(key)) {
    searchCache.delete(key)
  }
  else if (searchCache.size >= SEARCH_CACHE_LIMIT) {
    const oldestKey = searchCache.keys().next().value

    if (oldestKey) {
      searchCache.delete(oldestKey)
    }
  }

  searchCache.set(key, value)
}

function getSearchBoost(term: string): Record<string, number> {
  const normalizedTerm = term.trim()
  const containsLatin = LATIN_CHAR_REGEX.test(normalizedTerm)

  return {
    title: containsLatin ? 4 : 4.5,
    titleEn: containsLatin ? 4.5 : 2.5,
    heading: 3.5,
    breadcrumbs: 1.8,
    content: 1,
  }
}

/**
 * Orama 搜索 Hook
 *
 * @param params 搜索参数
 * @returns 搜索结果和加载状态
 */
export function useOramaSearch(params: UseOramaSearchParams): UseOramaSearchReturn {
  const { term, limit = 20 } = params

  const [results, setResults] = useState<OramaSearchResult<SearchDocument> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [debouncedTerm, setDebouncedTerm] = useState(term)

  // 使用 ref 追踪最新的请求，避免竞态条件
  const latestRequestRef = useRef(0)
  const normalizedDebouncedTerm = debouncedTerm.trim()
  const cacheKey = normalizedDebouncedTerm
    ? getSearchCacheKey(normalizedDebouncedTerm, limit)
    : null
  const cachedResults = cacheKey ? searchCache.get(cacheKey) ?? null : null

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedTerm(term)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [term])

  useEffect(() => {
    const requestId = ++latestRequestRef.current

    if (!normalizedDebouncedTerm || cachedResults) {
      return
    }

    queueMicrotask(() => {
      if (requestId !== latestRequestRef.current) {
        return
      }

      setLoading(true)
      setError(null)
      setResults(null)
    })

    const orama = getOramaClient()

    orama
      .search({
        term: normalizedDebouncedTerm,
        limit,
        boost: getSearchBoost(normalizedDebouncedTerm),
      })
      .then((searchResults) => {
        // 仅更新最新请求的结果，忽略过期请求
        if (requestId === latestRequestRef.current) {
          setCachedResult(cacheKey!, searchResults)
          setResults(searchResults)
          setLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (requestId === latestRequestRef.current) {
          const resolvedError = error instanceof Error
            ? error
            : new Error('Orama 搜索失败')

          console.error('Orama 搜索失败：', resolvedError)
          setResults(null)
          setError(resolvedError)
          setLoading(false)
        }
      })
  }, [cacheKey, cachedResults, limit, normalizedDebouncedTerm])

  const hasSearchTerm = !!normalizedDebouncedTerm
  const hasCachedResults = hasSearchTerm && cachedResults !== null

  return {
    results: hasCachedResults ? cachedResults : (hasSearchTerm ? results : null),
    loading: hasSearchTerm && !hasCachedResults && loading,
    error: hasSearchTerm && !hasCachedResults ? error : null,
  }
}
