'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { MaximizeIcon, MinimizeIcon, RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import mermaid from 'mermaid'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

interface ControlButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode
  label: string
}

function ControlButton(props: ControlButtonProps) {
  const { icon, label, onClick } = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className="rounded-[0.2rem]"
          size="iconSm"
          variant="ghost"
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>

      <TooltipContent
        align="center"
        side="top"
      >
        {label}
      </TooltipContent>
    </Tooltip>

  )
}

interface MermaidChartProps {
  rendered: string
  className?: string
  showControls?: boolean
  controlsClassName?: string
  toggleFullScreen?: () => void
  isFullScreen?: boolean
}

function MermaidChart(props: MermaidChartProps) {
  const {
    rendered,
    className = '',
    showControls = true,
    controlsClassName,
    toggleFullScreen,
    isFullScreen,
  } = props

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const handleZoom = useEvent((delta: number) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta

      return newScale < 0.5 ? 0.5 : newScale > 3 ? 3 : newScale
    })
  })

  const handleDragStart = useEvent((ev: React.MouseEvent | React.TouchEvent) => {
    ev.preventDefault()
    setIsDragging(true)

    if ('touches' in ev) {
      // 触摸事件
      setDragStart({
        x: ev.touches[0].clientX - position.x,
        y: ev.touches[0].clientY - position.y,
      })
    }
    else {
      // 鼠标事件
      setDragStart({
        x: ev.clientX - position.x,
        y: ev.clientY - position.y,
      })
    }
  })

  const handleDrag = useEvent((ev: MouseEvent | TouchEvent) => {
    if (!isDragging) {
      return
    }

    let clientX, clientY

    if ('touches' in ev) {
      // 触摸事件
      clientX = ev.touches[0].clientX
      clientY = ev.touches[0].clientY
    }
    else {
      // 鼠标事件
      clientX = ev.clientX
      clientY = ev.clientY
    }

    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  })

  const handleDragEnd = useEvent(() => {
    setIsDragging(false)
  })

  /**
   * 处理滚轮缩放功能
   *
   * 注意：在现代浏览器中，wheel 事件默认以 passive: true 模式监听，
   * 这意味着浏览器会立即开始滚动而不等待 JavaScript 执行完毕。
   * 这种机制可以提高页面滚动性能，但会导致 preventDefault() 无效。
   *
   * 缩放逻辑：
   * - 在全屏模式下：直接使用滚轮进行缩放，无需按修饰键
   * - 在普通模式下：需要按住 Ctrl/Meta + 滚轮才能缩放
   *
   * 这就需要在添加事件监听器时显式设置 { passive: false }。
   *
   * 如果直接使用 React 的 onWheel 属性，会遇到以下错误：
   * "Unable to preventDefault inside passive event listener invocation."
   */
  const handleWheel = useEvent((ev: WheelEvent) => {
    const metaKey = ev.metaKey || ev.ctrlKey

    // 在全屏模式下直接缩放，或者在普通模式下按住修饰键时缩放
    if (isFullScreen || metaKey) {
      ev.preventDefault()
      ev.stopPropagation()

      // 根据滚轮方向决定缩放方向
      const delta = ev.deltaY < 0 ? 0.1 : -0.1
      handleZoom(delta)
    }
  })

  // 添加和移除全局事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('touchmove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchend', handleDragEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('touchmove', handleDrag)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging, dragStart, handleDrag, handleDragEnd])

  /**
   * 使用原生 DOM API 添加滚轮事件监听器
   *
   * 为什么不直接使用 React 的 onWheel 属性：
   * 1. React 使用浏览器默认设置添加事件监听器，wheel 事件默认是 passive: true
   * 2. 在被动监听器中调用 preventDefault() 会导致错误
   *
   * 解决方案：
   * 1. 使用 useRef 获取图表容器 DOM 元素
   * 2. 通过原生 addEventListener 添加 wheel 事件监听器
   * 3. 显式指定 { passive: false } 选项，告知浏览器我们会调用 preventDefault()
   *
   * 这样在用户按住 Ctrl/Meta 键滚动时，可以正确阻止页面滚动并实现图表缩放
   */
  useEffect(() => {
    const chartElement = chartContainerRef.current

    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        chartElement.removeEventListener('wheel', handleWheel)
      }
    }
  }, [handleWheel, isFullScreen])

  // 重置位置和缩放
  const resetView = () => {
    setPosition({ x: 0, y: 0 })
    setScale(1)
  }

  return (
    <div
      ref={chartContainerRef}
      aria-label="可拖动的图表区域"
      className={cn('size-full group/mermaid-chart', className)}
      role="button"
      tabIndex={0}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div
        dangerouslySetInnerHTML={{ __html: rendered }}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.1s ease',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />

      {/* 控制按钮 */}
      {showControls && (
        <div
          className={cn(
            'absolute',
            'flex gap-1 z-10 rounded-sm p-0.5 border border-border bg-background/50 backdrop-blur-sm shadow-xs',
            isFullScreen ? 'top-4 right-4' : 'top-1 right-1',
            !isFullScreen && 'group-hover/mermaid-chart:opacity-100 opacity-0 transition-opacity',
            controlsClassName,
          )}
        >
          <ControlButton
            icon={<ZoomInIcon className="size-[1em]" />}
            label="放大"
            onClick={() => { handleZoom(0.1) }}
          />

          <ControlButton
            icon={<ZoomOutIcon className="size-[1em]" />}
            label="缩小"
            onClick={() => { handleZoom(-0.1) }}
          />

          <ControlButton
            icon={<RotateCcwIcon className="size-[1em]" />}
            label="重置视图"
            onClick={() => { resetView() }}
          />

          {toggleFullScreen && (
            <ControlButton
              icon={
                isFullScreen
                  ? <MinimizeIcon className="size-[1em]" />
                  : <MaximizeIcon className="size-[1em]" />
              }
              label={isFullScreen ? '退出全屏' : '切换全屏'}
              onClick={() => { toggleFullScreen() }}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram(props: MermaidDiagramProps) {
  const { chart, className } = props

  const [rendered, setRendered] = useState<string>('')
  const [isFullScreen, setIsFullScreen] = useState(false)

  // 处理 mermaid 初始化和图表渲染
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'var(--font-maple-mono)',
    })

    // 确保初始化完成后再渲染图表
    const renderChart = async () => {
      if (chart.trim() !== '') {
        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart)
          setRendered(svg)
        }
        catch (err) {
          console.error('渲染 Mermaid 图表时出错:', err)

          if (err instanceof Error) {
            setRendered(`<pre>${err.message}</pre>`)
          }
        }
      }
    }

    void renderChart()
  }, [chart]) // 当主题或图表内容变化时重新初始化和渲染

  // 处理全屏切换
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className="size-full p-1 rounded-md border border-border bg-muted/80"
      >
        <div className="relative bg-background size-full flex items-center justify-center rounded-[0.3rem] overflow-hidden p-1">
          <MermaidChart
            className="min-h-[200px] max-h-[500px]"
            isFullScreen={isFullScreen}
            rendered={rendered}
            toggleFullScreen={toggleFullScreen}
          />
        </div>
      </div>

      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent fullScreen className="overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">
            .
          </DialogTitle>

          <DialogDescription className="sr-only">
            .
          </DialogDescription>

          <MermaidChart
            className="p-5"
            isFullScreen={isFullScreen}
            rendered={rendered}
            toggleFullScreen={toggleFullScreen}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
