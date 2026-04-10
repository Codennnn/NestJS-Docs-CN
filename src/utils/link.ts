import { joinURL } from 'ufo'

import { SITE_CONFIG } from '~/constants/common'
import { RoutePath } from '~/constants/routes.client'
import { navMainData } from '~/lib/data/nav'
import { normalizePath } from '~/lib/utils'
import type { NavMenuItem } from '~/types/nav'
import { isClient } from '~/utils/platform'

/**
 * 判断字符串是否为有效的 URL
 *
 * @param url 待检查的字符串
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)

    return true
  }
  catch {
    return false
  }
}

/**
 * 判断链接是否为外部链接的函数
 * 使用更准确的判断逻辑，基于 URL 构造函数和协议检查
 *
 * @param href 链接地址
 * @param currentHost 当前网站的主机名（可选，默认为 window.location.hostname）
 * @returns 是否为外部链接
 */
export function isExternalLink(href: string, currentHost?: string): boolean {
  // 空字符串或仅包含空白字符的链接不是外部链接
  if (!href.trim()) {
    return false
  }

  // 以 # 开头的锚点链接不是外部链接
  if (href.startsWith('#')) {
    return false
  }

  // 以 / 开头的绝对路径不是外部链接
  if (href.startsWith('/')) {
    return false
  }

  // 以 . 开头的相对路径不是外部链接
  if (href.startsWith('./') || href.startsWith('../')) {
    return false
  }

  // 尝试解析为 URL
  try {
    const url = new URL(href)

    // 如果没有协议，说明是相对链接，不是外部链接
    if (!url.protocol) {
      return false
    }

    // 特殊协议（如 mailto:, tel:, javascript: 等）视为外部链接
    const protocol = url.protocol.toLowerCase()

    if (!protocol.startsWith('http')) {
      return true
    }

    // 如果提供了当前主机名，比较主机名
    if (currentHost) {
      return url.hostname.toLowerCase() !== currentHost.toLowerCase()
    }

    // 如果在浏览器环境中，使用 window.location.hostname
    if (isClient()) {
      return url.hostname.toLowerCase() !== window.location.hostname.toLowerCase()
    }

    // 如果无法获取当前主机名，则认为有完整协议和主机名的链接是外部链接
    return true
  }
  catch {
    // 如果无法解析为 URL，但包含协议标识符，可能是外部链接
    return /^[a-z][a-z0-9+.-]*:/i.test(href)
  }
}

/**
 * 判断链接是否为内部链接的函数
 *
 * @param href 链接地址
 * @param currentHost 当前网站的主机名（可选）
 * @returns 是否为内部链接
 */
export function isInternalLink(href: string, currentHost?: string): boolean {
  return !isExternalLink(href, currentHost)
}

/**
 * 判断链接是否为锚点链接的函数
 *
 * @param href 链接地址
 * @returns 是否为锚点链接
 */
export function isHashLink(href: string): boolean {
  return href.startsWith('#')
}

/**
 * 获取文档访问链接的函数
 *
 * 统一处理内部链接和外部链接的逻辑：
 * - 外部链接：直接返回原链接
 * - 锚点链接：直接返回原链接
 * - 以 / 开头的内部链接：添加 docs 前缀并规范化
 * - 以 . 开头的相对链接：添加 docs 前缀并规范化
 * - 其他内部链接：添加 docs 前缀并规范化
 *
 * @param href 原始链接地址
 * @returns 最终访问链接
 */
export function getDocLinkHref(href: string): string {
  // 外部链接或锚点链接直接返回
  if (isExternalLink(href) || isHashLink(href)) {
    return href
  }

  return joinURL(RoutePath.Docs, href)
}

/**
 * 生成完整的绝对 URL 地址
 *
 * 将相对路径转换为完整的绝对 URL，主要用于：
 * - SEO 优化（sitemap、robots.txt 等）
 * - Open Graph 元数据
 * - 结构化数据（JSON-LD）
 * - 外部链接分享
 *
 * @param path - 相对路径，可选参数，默认为空字符串
 * @returns 完整的绝对 URL 地址
 *
 * @example
 * ```ts
 * getFullUrl() // 'https://nestjs.leoku.dev/'
 * getFullUrl('/docs') // 'https://nestjs.leoku.dev/docs'
 * getFullUrl('docs/overview') // 'https://nestjs.leoku.dev/docs/overview'
 * ```
 */
export function getFullUrl(path = '') {
  const normalizedPath = normalizePath(path)

  return `${SITE_CONFIG.baseUrl}${normalizedPath}`
}

/**
 * 检查给定的文档路径是否在导航数据中存在
 * @param docPath - 文档路径
 * @returns 是否存在该路径
 */
function isValidDocPath(docPath: string): boolean {
  const normalizedPath = normalizePath(docPath)

  // 递归检查所有导航项
  function checkNavItems(items: NavMenuItem[]): boolean {
    for (const item of items) {
      // 如果有 url 属性，检查是否匹配
      if (item.url && normalizePath(item.url) === normalizedPath) {
        return true
      }

      // 如果有子项，递归检查
      if (item.items && Array.isArray(item.items)) {
        if (checkNavItems(item.items)) {
          return true
        }
      }
    }

    return false
  }

  return checkNavItems(navMainData)
}

// 生成文档 URL
export function getDocsUrl(docPath = ''): string {
  const normalizedPath = normalizePath(docPath)

  // 如果路径为空，返回文档首页
  if (!normalizedPath) {
    return getFullUrl(RoutePath.Docs)
  }

  // 验证路径是否在导航数据中存在，存在则返回完整 URL
  if (isValidDocPath(normalizedPath)) {
    return getFullUrl(`${RoutePath.Docs}${normalizedPath}`)
  }

  return RoutePath.Docs
}
