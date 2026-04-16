'use client'

import { useEffect, useRef, useState } from 'react'

import { getAlgoliaIndexName, getAlgoliaSearchClient } from '~/lib/algolia'
import type { AlgoliaSearchResult, SearchDocument } from '~/types/doc'

interface UseAlgoliaSearchParams {
  /**
   * 搜索关键词
   */
  term: string
  /**
   * 返回结果数量上限
   */
  limit?: number
}

interface UseAlgoliaSearchReturn {
  /**
   * 搜索结果列表
   */
  results: AlgoliaSearchResult[]
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

/**
 * Algolia 搜索 Hook
 *
 * @param params 搜索参数
 * @returns 搜索结果和加载状态
 */
export function useAlgoliaSearch(params: UseAlgoliaSearchParams): UseAlgoliaSearchReturn {
  const { term, limit = 20 } = params

  const [results, setResults] = useState<AlgoliaSearchResult[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [errorTerm, setErrorTerm] = useState('')
  const [settledTerm, setSettledTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState(term)

  // 追踪最新请求，避免过期响应覆盖当前结果
  const latestRequestRef = useRef(0)
  const normalizedTerm = term.trim()
  const normalizedDebouncedTerm = debouncedTerm.trim()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedTerm(term)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [term])

  useEffect(() => {
    if (!normalizedDebouncedTerm) {
      latestRequestRef.current += 1

      return
    }

    const requestId = ++latestRequestRef.current
    let cancelled = false

    const indexName = getAlgoliaIndexName()

    void Promise.resolve()
      .then(() => getAlgoliaSearchClient())
      .then((client) =>
        client.searchForHits<SearchDocument>({
          requests: [
            {
              indexName,
              query: normalizedDebouncedTerm,
              hitsPerPage: limit,
              distinct: true,
              attributesToRetrieve: [
                'title', 'titleEn', 'heading', 'anchor',
                'path', 'section', 'category', 'breadcrumbs',
                'isOverview', 'order', 'pageOrder', 'sectionKey',
                'chunkIndex', 'chunkCount',
              ],
              attributesToHighlight: ['title', 'titleEn', 'heading'],
              attributesToSnippet: ['content:24'],
              snippetEllipsisText: '…',
              highlightPreTag: '<mark class="bg-theme/15 rounded-xs text-current">',
              highlightPostTag: '</mark>',
            },
          ],
        }),
      )
      .then(({ results: [response] }) => {
        if (cancelled || requestId !== latestRequestRef.current) {
          return
        }

        setResults(response.hits)
        setError(null)
        setErrorTerm('')
        setSettledTerm(normalizedDebouncedTerm)
      })
      .catch((err: unknown) => {
        if (cancelled || requestId !== latestRequestRef.current) {
          return
        }

        const resolvedError = err instanceof Error
          ? err
          : new Error('Algolia 搜索失败')

        console.error('Algolia 搜索失败：', resolvedError)
        setResults([])
        setError(resolvedError)
        setErrorTerm(normalizedDebouncedTerm)
        setSettledTerm(normalizedDebouncedTerm)
      })

    return () => {
      cancelled = true
    }
  }, [limit, normalizedDebouncedTerm])

  const isLoading = !!normalizedDebouncedTerm && normalizedDebouncedTerm !== settledTerm

  return {
    results: normalizedDebouncedTerm ? results : [],
    loading: isLoading,
    error: normalizedTerm === normalizedDebouncedTerm
      && errorTerm === normalizedDebouncedTerm
      ? error
      : null,
  }
}
