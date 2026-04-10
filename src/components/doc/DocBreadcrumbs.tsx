'use client'

import { Fragment } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { RoutePath } from '~/constants/routes.client'
import { navMainData } from '~/lib/data/nav'
import type { NavMenuItem } from '~/types/nav'
import { getDocTitle } from '~/utils/docs.client'
import { getDocsUrl } from '~/utils/link'

interface DocBreadcrumbsProps {
  /** 可以传入额外的类名以覆盖默认样式 */
  className?: string
}

interface BreadcrumbItem {
  name: string
  url?: string
}

/**
 * 根据 URL 在导航数据中查找对应的路径
 */
function findNavPath(url: string, navData: NavMenuItem[] = navMainData): NavMenuItem[] | null {
  for (const item of navData) {
    // 如果当前项有 URL 且匹配
    if (item.url === url) {
      return [item]
    }

    // 如果当前项有子项，递归查找
    if (item.items) {
      const childPath = findNavPath(url, item.items)

      if (childPath) {
        return [item, ...childPath]
      }
    }
  }

  return null
}

/**
 * 文档面包屑导航组件
 *
 * - 根据当前 `/docs` 路径和 navMainData 自动生成层级
 * - 最后一级使用 `BreadcrumbPage` 显示当前文档标题
 */
export function DocBreadcrumbs({ className }: DocBreadcrumbsProps) {
  const pathname = usePathname()

  // 获取当前文档路径，去掉 /docs 前缀
  const docPath = pathname.startsWith(RoutePath.Docs)
    ? pathname.replace(/^\/docs\/?/, '')
    : null

  if (!docPath) {
    return null
  }

  // 在导航数据中查找当前路径
  const navPath = findNavPath(`/${docPath}`)

  // 构建面包屑数据
  const breadcrumbs: BreadcrumbItem[] = [{ name: '文档', url: RoutePath.Docs }]

  if (navPath) {
    // 根据导航路径构建面包屑
    navPath.forEach((navItem, index) => {
      const isLast = index === navPath.length - 1
      breadcrumbs.push({
        name: navItem.title ?? getDocTitle(docPath, [docPath]),
        url: isLast ? undefined : navItem.url ? getDocsUrl(navItem.url.replace(/^\//, '')) : undefined,
      })
    })
  }
  else {
    // 如果在导航数据中找不到，回退到原来的逻辑
    const segments = docPath.split('/')
    segments.forEach((segment, idx) => {
      const currentPath = segments.slice(0, idx + 1).join('/')
      const isCurrent = currentPath === docPath

      breadcrumbs.push({
        name: getDocTitle(currentPath, [segment]),
        url: isCurrent ? undefined : getDocsUrl(currentPath),
      })
    })
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.url ?? crumb.name}>
            <BreadcrumbItem>
              {crumb.url
                ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.url}>{crumb.name}</Link>
                    </BreadcrumbLink>
                  )
                : (
                    <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                  )}
            </BreadcrumbItem>

            {/* 非最后一个元素时插入分隔符 */}
            {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
