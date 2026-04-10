'use client'

import { useEffect, useRef, useState } from 'react'

import { type BundledLanguage } from 'shiki'

import { CodeContainer } from '~/components/code/CodeContainer'
import { highlightCode } from '~/components/code/transformers'

/**
 * 代码高亮结果缓存
 *
 * 缓存机制说明：
 * 1. 使用 Map 数据结构存储已经高亮处理过的代码结果
 * 2. 缓存键由语言、是否显示行号、代码内容组成，确保唯一性
 * 3. 避免重复的高亮计算，提升性能
 * 4. 实现了简单的 LRU（最近最少使用）缓存清理策略
 */
const highlightCache = new Map<string, string>()

interface ClientCodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
  showLineNumbers?: boolean
}

export function ClientCodeBlock(props: ClientCodeBlockProps) {
  const { code, lang, filename, showLineNumbers } = props

  const [htmlOutput, setHtmlOutput] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingState, setShowLoadingState] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    /**
     * 缓存键生成策略
     *
     * 组合三个关键参数生成唯一缓存键：
     * - lang: 编程语言，影响语法高亮规则
     * - showLineNumbers: 是否显示行号，影响渲染结果
     * - code: 代码内容，核心数据
     *
     * 这样确保相同配置的代码块能够复用缓存结果
     */
    const cacheKey = `${lang}-${showLineNumbers}-${code}`

    /**
     * 缓存命中检查
     *
     * 如果缓存中存在对应结果：
     * 1. 直接使用缓存的 HTML 结果
     * 2. 立即设置为非加载状态
     * 3. 跳过后续的异步高亮处理
     *
     * 这是性能优化的关键：避免重复计算
     */
    const cachedResult = highlightCache.get(cacheKey)

    if (cachedResult) {
      setHtmlOutput(cachedResult)
      setIsLoading(false)
      setShowLoadingState(false)
    }
    else {
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 如果已经有内容，先保持显示旧内容，避免抖动
      const hasExistingContent = htmlOutput !== ''

      // 延迟显示加载状态，避免快速切换时的抖动
      const loadingTimer = setTimeout(() => {
        if (isLoading && !hasExistingContent) {
          setShowLoadingState(true)
        }
      }, 200) // 200ms 延迟

      // 防抖高亮处理
      debounceTimerRef.current = setTimeout(() => {
        void (async () => {
          try {
            setIsLoading(true)

            const out = await highlightCode({
              code,
              lang,
            })

            /**
             * 缓存结果存储
             *
             * 将高亮处理后的 HTML 结果存储到缓存中：
             * - 键：之前生成的 cacheKey
             * - 值：高亮后的 HTML 字符串
             *
             * 后续相同的代码块可以直接使用这个结果
             */
            highlightCache.set(cacheKey, out)

            /**
             * 缓存大小限制与清理策略
             *
             * 实现简单的缓存管理：
             * 1. 限制缓存条目数量为 100 个
             * 2. 当超过限制时，删除最早添加的条目（FIFO策略）
             * 3. 防止内存无限增长
             *
             * 注意：这里使用的是 FIFO 而不是真正的 LRU，
             * 因为 Map 的迭代顺序是插入顺序
             */
            if (highlightCache.size > 100) {
              const firstKey = highlightCache.keys().next().value

              if (firstKey) {
                highlightCache.delete(firstKey)
              }
            }

            setHtmlOutput(out)
            setShowLoadingState(false)
          }
          catch (err) {
            console.warn('代码高亮失败:', err)

            // 如果高亮失败，使用纯文本
            setHtmlOutput(`
              <pre>
                <code>${code}</code>
              </pre>
            `)

            setShowLoadingState(false)
          }
          finally {
            setIsLoading(false)
          }
        })()
      }, 100) // 100ms 防抖

      return () => {
        clearTimeout(loadingTimer)

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }
  }, [code, lang, showLineNumbers, htmlOutput, isLoading])

  // 渲染内容区域的函数
  const renderContent = () => {
    // 显示加载状态
    if (showLoadingState && !htmlOutput) {
      return (
        <div className="p-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            正在高亮代码...
          </div>
        </div>
      )
    }

    // 显示高亮后的代码
    if (htmlOutput) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: htmlOutput }}
        />
      )
    }

    // 显示纯文本版本（fallback）
    return (
      <div className="p-4">
        <pre className="text-sm">
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <CodeContainer
      code={code}
      filename={filename}
      lang={lang}
    >
      {renderContent()}
    </CodeContainer>
  )
}
