import { navMainData } from '~/lib/data/nav'
import { normalizePath } from '~/lib/utils'
import type { NavMenuItem } from '~/types/nav'

/**
 * 扁平化导航数据，获取所有文档的有序列表
 */
function flattenNavItems(items: NavMenuItem[]): { title: string, url: string }[] {
  const result: { title: string, url: string }[] = []

  for (const item of items) {
    if (item.url) {
      result.push({
        title: item.title ?? '',
        url: item.url,
      })
    }

    if (item.items) {
      result.push(...flattenNavItems(item.items))
    }
  }

  return result
}

/**
 * 获取文档导航信息（上一篇和下一篇）
 */
export function getDocNavigation(currentPath: string): {
  prev: { title: string, url: string } | null
  next: { title: string, url: string } | null
} {
  const allDocs = flattenNavItems(navMainData)

  const normalizedPath = normalizePath(currentPath)

  const currentIndex = allDocs.findIndex((doc) => doc.url === normalizedPath)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  const prev = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const next = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  return { prev, next }
}

/**
 * 根据 URL 路径从导航数据中获取中文标题
 */
export function getDocTitleFromNav(docPath: string): string | null {
  const normalizedPath = normalizePath(docPath)

  // 递归搜索导航项
  function findTitleInNavItems(items: NavMenuItem[]): string | null {
    for (const item of items) {
      // 检查当前项是否匹配
      if (item.url === normalizedPath) {
        return item.title ?? null
      }

      // 递归检查子项
      if (item.items) {
        const foundTitle = findTitleInNavItems(item.items)

        if (foundTitle) {
          return foundTitle
        }
      }
    }

    return null
  }

  return findTitleInNavItems(navMainData)
}

/**
 * 统一获取文档标题
 * 优先从导航数据中获取中文标题，如果找不到则使用默认格式化逻辑
 */
export function getDocTitle(docPath: string, fallbackSegments?: string[]): string {
  // 首先尝试从导航数据中获取中文标题
  const titleFromNav = getDocTitleFromNav(docPath)

  if (titleFromNav) {
    return titleFromNav
  }

  // 如果没有找到，使用默认格式化逻辑
  // 如果提供了 fallbackSegments，使用最后一个段；否则从 docPath 中提取
  const segment = fallbackSegments?.at(-1) ?? docPath.split('/').at(-1) ?? ''

  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
