import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPageTitle } from '~/utils/common'

export function generateMetadata(): Metadata {
  return {
    title: getPageTitle(),
  }
}

/**
 * 通用 404 页面组件
 *
 * 作用:
 * - 处理所有未定义路由的访问请求
 * - 通过 Next.js 内置的 notFound() 函数返回 404 状态
 *
 * 工作原理:
 * - [...slug] 是 Next.js 的 catch-all 路由语法
 * - 当访问未定义的路由时，会匹配到这个组件
 * - notFound() 会触发 Next.js 的 404 错误处理机制
 *
 * 使用场景:
 * - 处理所有不存在的路由访问
 * - 提供统一的 404 错误响应
 */
export default function CatchAllPage() {
  notFound()
}
