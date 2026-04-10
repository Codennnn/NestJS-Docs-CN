'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { throttle } from 'lodash-es'
import { CircleChevronUp } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { SCROLL_CONFIG } from '~/lib/scroll-config'

interface ScrollToTopProps {
  /** 滚动容器 ID */
  containerId: string
  /**
   * 滚动多少像素后显示回到顶部按钮
   * @default SCROLL_CONFIG.SCROLL_THRESHOLD
   */
  scrollThreshold?: number
  /**
   * 滚动事件节流延迟（毫秒）
   * @default SCROLL_CONFIG.THROTTLE_DELAY
   */
  throttleDelay?: number
}

export function ScrollToTop(props: ScrollToTopProps) {
  const {
    containerId,
    scrollThreshold = SCROLL_CONFIG.SCROLL_THRESHOLD,
    throttleDelay = SCROLL_CONFIG.THROTTLE_DELAY,
  } = props

  const [isVisible, setIsVisible] = useState(false)

  const getScrollContainer = useEvent(() => {
    return document.getElementById(containerId)
  })

  useEffect(() => {
    const toggleVisibility = throttle(() => {
      // 查找滚动容器
      const scrollContainer = getScrollContainer()

      if (scrollContainer && scrollContainer.scrollTop > scrollThreshold) {
        setIsVisible(true)
      }
      else {
        setIsVisible(false)
      }
    }, throttleDelay)

    // 查找滚动容器并添加事件监听
    const scrollContainer = getScrollContainer()

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility)

      return () => {
        scrollContainer.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [getScrollContainer, scrollThreshold, throttleDelay])

  const handleScrollToTop = useEvent(() => {
    const scrollContainer = getScrollContainer()

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  })

  if (!isVisible) {
    return null
  }

  return (
    <Button
      className="inline-flex items-center gap-2 h-6 transition-all animate-in fade-in-0 slide-in-from-bottom-2 justify-start text-xs text-muted-foreground"
      size="sm"
      title="回到顶部"
      variant="ghost"
      onClick={() => {
        handleScrollToTop()
      }}
    >
      <CircleChevronUp className="size-3.5" />
      回到顶部
    </Button>
  )
}
