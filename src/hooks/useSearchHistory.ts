import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useLocalStorageArray } from './useLocalStorage'

export interface SearchHistoryItem {
  term: string
  timestamp: number
  resultsCount?: number
  clicked?: boolean
  category?: string
}

// 搜索历史管理
export function useSearchHistory() {
  const [history, setHistory, removeHistory, isLoading] = useLocalStorageArray<SearchHistoryItem>(
    'doc-search-history',
    {
      defaultValue: [],
      onError: (error, operation) => {
        console.warn(`搜索历史 ${operation} 操作失败：`, error)
      },
    },
  )

  const historyArray = useMemo(() => history ?? [], [history])

  // 添加到历史记录
  const addToHistory = useEvent((
    term: string,
    resultsCount?: number,
    category?: string,
  ) => {
    if (!term.trim()) {
      return
    }

    setHistory((prev = []) => {
      // 移除已存在的相同搜索词
      const filtered = prev.filter((item: SearchHistoryItem) => item.term !== term)

      const newItem: SearchHistoryItem = {
        term: term.trim(),
        timestamp: Date.now(),
        resultsCount,
        category,
        clicked: false,
      }

      return [newItem, ...filtered].slice(0, 20) // 保留最近 20 条
    })
  })

  // 标记搜索词为已点击
  const markAsClicked = useEvent((term: string) => {
    setHistory((prev = []) =>
      prev.map((item: SearchHistoryItem) =>
        item.term === term ? { ...item, clicked: true } : item,
      ),
    )
  })

  // 删除特定的历史记录
  const removeFromHistory = useEvent((term: string) => {
    setHistory((prev = []) =>
      prev.filter((item: SearchHistoryItem) => item.term !== term),
    )
  })

  // 清空历史记录
  const clearHistory = useEvent(() => {
    removeHistory()
  })

  // 获取热门搜索词
  const getPopularSearches = useEvent(() => {
    return historyArray
      .filter((item) => item.resultsCount && item.resultsCount > 0)
      .sort((a, b) => (b.resultsCount ?? 0) - (a.resultsCount ?? 0))
      .slice(0, 5)
  })

  // 获取最近的搜索词
  const getRecentSearches = useEvent(() => {
    return historyArray
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  })

  // 搜索统计
  const getSearchStats = useEvent(() => {
    const totalSearches = historyArray.length
    const successfulSearches = historyArray.filter((item) =>
      item.resultsCount && item.resultsCount > 0,
    ).length
    const clickedSearches = historyArray.filter((item) => item.clicked).length

    return {
      totalSearches,
      successfulSearches,
      clickedSearches,
      successRate: totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0,
      clickRate: totalSearches > 0 ? (clickedSearches / totalSearches) * 100 : 0,
    }
  })

  return {
    history: historyArray,
    isLoading,
    addToHistory,
    removeFromHistory,
    markAsClicked,
    clearHistory,
    getPopularSearches,
    getRecentSearches,
    getSearchStats,
  }
}
