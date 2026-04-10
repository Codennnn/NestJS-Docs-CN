import { startTransition, useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { SCROLL_CONFIG } from '~/lib/scroll-config'

const getHeadings = () => {
  return document.querySelectorAll(`#${SCROLL_CONFIG.CONTAINER_ID} article :where(h1, h2, h3)`)
}

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsHook {
  tocItems: TocItem[]
  activeId: string
}

export function useTableOfContents(): TableOfContentsHook {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  const pathname = usePathname()

  // 提取页面中的标题元素
  useEffect(() => {
    const extractHeadings = () => {
      const headings = getHeadings()

      const items: TocItem[] = []

      headings.forEach((heading) => {
        const id = heading.id
        const text = heading.textContent || ''
        const level = parseInt(heading.tagName.charAt(1))

        if (id && text) {
          items.push({ id, text, level })
        }
      })

      setTocItems(items)
    }

    // 重置状态
    startTransition(() => {
      setTocItems([])
      setActiveId('')
    })

    // 延迟执行以确保 MDX 内容已渲染
    const timer = setTimeout(extractHeadings, 100)

    // 监听 DOM 变化，以防内容动态加载
    const observer = new MutationObserver(extractHeadings)
    const articleElement = document.querySelector('article')

    if (articleElement) {
      observer.observe(articleElement, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname]) // 添加 pathname 依赖，确保路由变化时重新执行

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (tocItems.length === 0) {
      return
    }

    const scrollContainer = document.getElementById(SCROLL_CONFIG.CONTAINER_ID)

    if (!scrollContainer) {
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const headings = getHeadings()

          const containerRect = scrollContainer.getBoundingClientRect()

          const scrollTop = scrollContainer.scrollTop

          const offset = 180 // 偏移量，用于提前高亮

          let currentId = ''

          // 从下往上遍历标题，找到第一个在视口上方的标题
          for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i] as HTMLElement
            const rect = heading.getBoundingClientRect()

            // 计算标题相对于滚动容器的位置
            const elementTop = rect.top - containerRect.top + scrollTop

            // 如果标题在当前滚动位置上方（考虑偏移量）
            if (elementTop <= scrollTop + offset) {
              currentId = heading.id
              break
            }
          }

          // 如果没有找到合适的标题（比如在页面顶部），使用第一个标题
          if (!currentId && headings.length > 0) {
            const firstHeading = headings[0] as HTMLElement

            if (firstHeading.id) {
              currentId = firstHeading.id
            }
          }

          setActiveId(currentId)

          ticking = false
        })

        ticking = true
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll() // 初始化时执行一次

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [tocItems])

  return {
    tocItems,
    activeId,
  }
}
