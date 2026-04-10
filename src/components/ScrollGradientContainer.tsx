'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { cn } from '~/lib/utils'

interface ScrollGradientContainerProps extends Pick<React.ComponentProps<'div'>, 'id' | 'className'> {
  rootClassName?: string
  enableFlex?: boolean
  gradientHeight?: string
  gradientFromColor?: string
  topGradientClass?: string
  bottomGradientClass?: string
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export const ScrollGradientContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ScrollGradientContainerProps>
>(function ScrollGradientContainer(props, ref) {
  const {
    children,
    id,
    className,
    rootClassName,
    enableFlex = false,
    gradientHeight = 'h-10',
    gradientFromColor = 'from-background',
    topGradientClass,
    bottomGradientClass,
    onScroll,
  } = props

  const scrollRef = useRef<HTMLDivElement>(null)

  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  })

  const handleInternalScroll = useEvent(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const canScrollUp = scrollTop > 0
      const canScrollDown = scrollTop < scrollHeight - clientHeight - 1

      setScrollState({ canScrollUp, canScrollDown })
    }
  })

  const handleScroll = useEvent((event: React.UIEvent<HTMLDivElement>) => {
    handleInternalScroll()

    // 调用外部传入的 onScroll 回调
    if (onScroll) {
      onScroll(event)
    }
  })

  useEffect(() => {
    const scrollElement = scrollRef.current

    if (scrollElement) {
      // 初始检查
      handleInternalScroll()

      // 监听容器本身的尺寸变化
      const resizeObserver = new ResizeObserver(handleInternalScroll)
      resizeObserver.observe(scrollElement)

      // 监听内容变化（DOM 节点增删、属性变化等）
      const mutationObserver = new MutationObserver(handleInternalScroll)
      mutationObserver.observe(scrollElement, {
        childList: true, // 监听子节点的增加和删除
        subtree: true, // 监听所有后代节点
        attributes: true, // 监听属性变化
        characterData: true, // 监听文本内容变化
      })

      return () => {
        resizeObserver.disconnect()
        mutationObserver.disconnect()
      }
    }
  }, [handleInternalScroll])

  // 将内部的 scrollRef 暴露给外部的 ref
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(scrollRef.current)
    }
    else if (ref) {
      ref.current = scrollRef.current
    }
  }, [ref])

  return (
    <div
      className={cn(
        'relative flex-1 size-full overflow-hidden',
        enableFlex && 'flex flex-col',
        rootClassName,
      )}
    >
      {/* 顶部渐变遮罩 */}
      {scrollState.canScrollUp && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 z-10 pointer-events-none',
            'bg-gradient-to-b to-transparent',
            gradientHeight,
            gradientFromColor,
            topGradientClass,
          )}
        />
      )}

      {/* 底部渐变遮罩 */}
      {scrollState.canScrollDown && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none',
            'bg-gradient-to-t to-transparent',
            gradientHeight,
            gradientFromColor,
            bottomGradientClass,
          )}
        />
      )}

      <div
        ref={scrollRef}
        className={cn('overflow-y-auto h-full', className)}
        id={id}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  )
})
