'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'

import { compile, type CompileOptions, run, type RunOptions } from '@mdx-js/mdx'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import type { BundledLanguage } from 'shiki'

import { CodeWrapper } from '~/components/code/CodeWrapper'
import { MermaidWrapper } from '~/components/doc/MermaidWrapper'
import { useMDXComponents } from '~/mdx-components'

import { ClientCodeBlock } from './ClientCodeBlock'

interface PreProps {
  children: React.ReactElement<{ className: string, children: React.ReactElement | string }>
  filename?: string
  showLineNumbers?: boolean
  hideInDoc?: boolean
}

export interface MDXRendererProps {
  content: string
}

interface CompileResult {
  Component: React.ComponentType<{ components?: Record<string, unknown> }>
  content: string // 记录对应的内容，用于追踪哪个内容版本对应哪个编译结果
  error?: Error
}

/**
 * 动态 MDX 渲染组件
 *
 * 支持运行时编译和渲染 MDX 内容，适用于流式内容和动态内容场景
 * 复用项目中定义的自定义组件
 *
 * 【错误降级处理机制】
 * 为了解决动态输入MDX内容时的渲染错误和内容抖动问题，采用以下策略：
 * 1. 保存上一次成功渲染的结果 (lastSuccessfulResult)
 * 2. 当新内容编译失败时，继续显示上一次成功的内容
 * 3. 当新内容编译成功时，立即切换到新内容并更新成功记录
 * 4. 静默处理错误，不显示错误提示UI，避免内容抖动
 */
export function MDXRenderer(props: MDXRendererProps) {
  const { content } = props

  // 当前编译结果状态
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null)

  // 【关键状态】保存上一次成功渲染的结果
  // 用于在新内容编译失败时提供降级显示，确保用户始终看到有意义的内容
  const [lastSuccessfulResult, setLastSuccessfulResult] = useState<CompileResult | null>(null)

  // 获取 MDX 组件
  const mdxComponents = useMDXComponents({
    // 覆盖 pre 组件使用客户端版本
    pre: (props: PreProps) => {
      const {
        children,
        filename,
        showLineNumbers = false,
        hideInDoc = false,
        ...restProps
      } = props

      if (children.type === 'code') {
        if (hideInDoc) {
          return null
        }

        const { className, children: codeContent } = children.props
        const lang = (className.replace(/language-/, '') || 'text')

        if (typeof codeContent === 'string') {
          if (lang === 'mermaid') {
            return <MermaidWrapper chart={codeContent} />
          }

          return (
            <ClientCodeBlock
              code={codeContent}
              filename={filename}
              lang={lang as BundledLanguage}
              showLineNumbers={showLineNumbers}
            />
          )
        }
      }

      return (
        <CodeWrapper>
          <pre {...restProps}>{children}</pre>
        </CodeWrapper>
      )
    },
  })

  // MDX 编译配置
  const compileOptions = useMemo<CompileOptions>(() => ({
    outputFormat: 'function-body',
    development: false, // 强制使用生产模式，避免 _jsxDEV 问题
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeMdxCodeProps,
      rehypeSlug,
    ],
  }), [])

  // 运行时配置
  const runOptions = useMemo<RunOptions>(() => ({
    Fragment: runtime.Fragment,
    jsx: runtime.jsx,
    jsxs: runtime.jsxs,
  }), [])

  // 安全的 MDX 内容预处理
  const preprocessContent = (rawContent: string): string => {
    if (rawContent.trim() !== '') {
      // 确保代码块完整性
      const lines = rawContent.split('\n')
      const processedLines: string[] = []
      let inCodeBlock = false

      for (const line of lines) {
      // 检测代码块开始
        if (/^```[\w]*$/.exec(line)) {
          if (!inCodeBlock) {
            inCodeBlock = true
            processedLines.push(line)
          }
          else {
          // 结束代码块
            inCodeBlock = false
            processedLines.push(line)
          }

          continue
        }

        processedLines.push(line)
      }

      // 如果内容在代码块中未完成，自动补全
      if (inCodeBlock) {
        processedLines.push('```')
      }

      return processedLines.join('\n')
    }

    return ''
  }

  // 编译 MDX 内容
  useEffect(() => {
    if (content) {
      let isCancelled = false

      const compileContent = async () => {
        try {
          // 预处理内容以确保 MDX 完整性
          const processedContent = preprocessContent(content)

          if (!processedContent.trim()) {
            setCompileResult(null)

            return
          }

          // 编译 MDX
          const compiledResult = await compile(processedContent, compileOptions)

          if (isCancelled) {
            return
          }

          // 运行编译后的代码
          const { default: MDXContent } = await run(compiledResult, runOptions)

          const newResult: CompileResult = {
            Component: MDXContent as React.ComponentType,
            content: content,
          }

          // 【成功路径】编译成功时，同时更新当前结果和最后成功结果
          setCompileResult(newResult)
          setLastSuccessfulResult(newResult) // 记录这次成功的结果，用于后续降级
        }
        catch (error) {
          if (isCancelled) {
            return
          }

          console.warn('MDX 编译失败:', error)

          // 【错误处理】编译失败时的降级策略
          // 1. 设置当前编译结果为错误状态
          // 2. 重要：不更新 lastSuccessfulResult，保持上一次成功的内容可用
          // 3. 这样在渲染时可以继续显示上一次成功的内容，避免内容抖动
          setCompileResult({
            Component: () => null,
            content: content,
            error: error instanceof Error ? error : new Error('Unknown error'),
          })

          // 注意：这里故意不调用 setLastSuccessfulResult，
          // 保持上一次成功的结果用于降级显示
        }
      }

      void compileContent()

      return () => {
        isCancelled = true
      }
    }
    else {
      // 内容为空时，清空所有状态
      startTransition(() => {
        setCompileResult(null)
        setLastSuccessfulResult(null)
      })
    }
  }, [content, compileOptions, runOptions])

  // 【核心逻辑】智能结果选择 - 错误降级处理的关键
  // 这个逻辑决定了最终渲染哪个版本的内容
  const resultToRender = useMemo(() => {
    // 情况1：当前编译成功 -> 使用最新的成功结果
    if (compileResult && !compileResult.error) {
      return compileResult
    }

    // 情况2：当前编译失败，但有历史成功结果 -> 降级显示上一次成功的内容
    // 这是防止内容抖动的关键：即使新内容有问题，用户仍能看到之前正常的内容
    if (compileResult?.error && lastSuccessfulResult) {
      return lastSuccessfulResult
    }

    // 情况3：其他情况（首次加载失败、没有历史成功记录等）-> 返回当前结果
    return compileResult
  }, [compileResult, lastSuccessfulResult])

  // 渲染 MDX 内容
  // 注意：这里使用 resultToRender 而不是直接使用 compileResult
  // 确保错误降级逻辑生效
  if (resultToRender?.Component && !resultToRender.error) {
    const { Component } = resultToRender

    return (
      <Component
        components={mdxComponents}
      />
    )
  }

  // 空内容状态
  return null
}
