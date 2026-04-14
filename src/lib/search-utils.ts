import type { SearchResult } from '~/types/doc'

interface CacheValue {
  results: SearchResult[]
  timestamp: number
  query: string
}

// 搜索结果缓存管理
export class SearchCache {
  private cache = new Map<string, CacheValue>()
  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  get(key: string): CacheValue | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: CacheValue): void {
    // 如果缓存超过最大限制，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value

      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, value)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// 高亮搜索关键词
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim() || !text) {
    return text
  }

  // 转义正则表达式特殊字符
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 支持多个关键词（空格分隔）
  const terms = escapedTerm.split(/\s+/).filter(Boolean)

  let highlightedText = text

  terms.forEach((term) => {
    const regex = new RegExp(`(${term})`, 'gi')
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-theme/15 rounded-xs text-current">$1</mark>',
    )
  })

  return highlightedText
}

// 生成缓存键
export function generateCacheKey(term: string): string {
  return term.trim().toLowerCase()
}

// 格式化文档路径
export function formatDocumentPath(path: string): string {
  if (!path) {
    return ''
  }

  return path.replace(/^\//, '').replace(/\.mdx?$/, '')
}

// 计算搜索相关性得分（如果 API 不提供）
export function calculateRelevanceScore(result: SearchResult, searchTerm: string): number {
  if (result.score !== undefined) {
    return result.score
  }

  const { document } = result

  if (!document) {
    return 0
  }

  let score = 0
  const term = searchTerm.toLowerCase()

  // 标题匹配权重最高
  if (document.title?.toLowerCase().includes(term)) {
    score += 0.4
  }

  // 标题完全匹配
  if (document.title?.toLowerCase() === term) {
    score += 0.3
  }

  // 子标题匹配
  if (document.heading?.toLowerCase().includes(term)) {
    score += 0.2
  }

  // 内容匹配
  if (document.content?.toLowerCase().includes(term)) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}
