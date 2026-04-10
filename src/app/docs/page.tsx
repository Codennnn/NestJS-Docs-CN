import { redirect } from 'next/navigation'

import { navMainData } from '~/lib/data/nav'
import { getDocLinkHref, isHashLink } from '~/utils/link'

export default function DocsIndexPage() {
  // 遍历导航数据查找第一个有效的 URL
  let firstValidUrl = '/introduction' // 默认值

  // 控制循环的标志位
  let found = false

  for (const item of navMainData) {
    // 检查项目是否有有效的 URL
    if (item.url && !isHashLink(item.url)) {
      firstValidUrl = item.url
      found = true
      break
    }

    // 如果主项目没有有效 URL，则检查其子项目
    if (Array.isArray(item.items) && item.items.length > 0) {
      for (const subItem of item.items) {
        if (subItem.url && !isHashLink(subItem.url)) {
          firstValidUrl = subItem.url
          found = true
          break
        }
      }

      if (found) {
        break // 如果在子项目中找到有效 URL，跳出外层循环
      }
    }
  }

  redirect(getDocLinkHref(firstValidUrl))
}
