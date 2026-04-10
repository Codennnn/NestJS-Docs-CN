'use client'

import { useEffect, useState } from 'react'

import { ProseContainer } from '~/components/ProseContainer'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import { MDXRenderer } from './MDXRenderer'

// 模拟流式内容的完整 Markdown 示例
const FULL_MARKDOWN_CONTENT = `# NestJS 文档示例

这是一个 **动态 MDX 渲染器** 测试。

## 基础语法

### 文本格式
- **粗体**
- *斜体*
- \`代码\`
- [链接](https://nestjs.com)

### 列表
1. 第一项
2. 第二项
   - 嵌套项

### 引用
> 这是引用内容

## 代码示例

\`\`\`typescript filename="app.ts" showLineNumbers
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
\`\`\`

## 表格

| 特性 | 状态 |
|------|------|
| DI | ✅ |
| 装饰器 | ✅ |

## Mermaid 图表

\`\`\`mermaid
graph TD
    A[请求] --> B[控制器]
    B --> C[服务]
    C --> D[响应]
\`\`\`

## 任务列表
- [x] 完成基础功能
- [ ] 添加测试

> 💡 **提示**: 这是简化版示例。`

// 代码块测试内容
const CODE_BLOCK_CONTENT = `# 代码块测试

## TypeScript 示例

\`\`\`typescript filename="user.service.ts" showLineNumbers
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findAll() {
    return [];
  }

  async findOne(id: number) {
    return { id, name: 'User' };
  }
}
\`\`\`

## JavaScript 配置

\`\`\`javascript filename="config.js"
const config = {
  port: 3000,
  database: 'app'
};

module.exports = config;
\`\`\`

## Shell 命令

\`\`\`bash
npm install
npm run start
\`\`\`

行内代码: \`@Injectable()\` 装饰器。`

// Mermaid 图表测试内容
const MERMAID_CONTENT = `# Mermaid 测试

## 架构图

\`\`\`mermaid
graph TB
    A[客户端] --> B[API]
    B --> C[服务]
    C --> D[数据库]
\`\`\`

## 流程图

\`\`\`mermaid
sequenceDiagram
    Client->>API: 请求
    API->>DB: 查询
    DB-->>API: 数据
    API-->>Client: 响应
\`\`\`

## 状态图

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Published
    Published --> [*]
\`\`\``

/**
 * 动态 MDX 渲染器演示组件
 *
 * 展示如何使用 DynamicMDXRenderer 组件处理流式内容
 * 包含丰富的 Markdown 语法元素测试
 */
export function MDXRendererDemo() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamSpeed, setStreamSpeed] = useState(50) // 毫秒
  const [currentTestType, setCurrentTestType] = useState<'full' | 'code' | 'mermaid' | null>(null)
  const [streamInterval, setStreamInterval] = useState<NodeJS.Timeout | null>(null)

  // 获取当前测试内容
  const getCurrentTestContent = () => {
    switch (currentTestType) {
      case 'full':
        return FULL_MARKDOWN_CONTENT

      case 'code':
        return CODE_BLOCK_CONTENT

      case 'mermaid':
        return MERMAID_CONTENT

      default:
        return ''
    }
  }

  // 模拟流式内容传输
  const startStreaming = (testType: 'full' | 'code' | 'mermaid') => {
    setContent('')
    setIsStreaming(true)
    setCurrentTestType(testType)

    const testContent = testType === 'full'
      ? FULL_MARKDOWN_CONTENT
      : testType === 'code'
        ? CODE_BLOCK_CONTENT
        : MERMAID_CONTENT

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex >= testContent.length) {
        clearInterval(interval)
        setIsStreaming(false)
        setStreamInterval(null)

        return
      }

      // 每次添加一个字符，模拟真实的流式传输
      setContent((prev) => prev + testContent[currentIndex])
      currentIndex++
    }, streamSpeed)

    setStreamInterval(interval)
  }

  // 终止流式传输
  const stopStreaming = () => {
    if (streamInterval) {
      clearInterval(streamInterval)
      setStreamInterval(null)
    }

    setIsStreaming(false)
  }

  // 重置内容
  const resetContent = () => {
    if (streamInterval) {
      clearInterval(streamInterval)
      setStreamInterval(null)
    }

    setContent('')
    setIsStreaming(false)
    setCurrentTestType(null)
  }

  // 立即显示完整内容
  const showFullContent = (testType: 'full' | 'code' | 'mermaid') => {
    if (streamInterval) {
      clearInterval(streamInterval)
      setStreamInterval(null)
    }

    setCurrentTestType(testType)
    const testContent = testType === 'full'
      ? FULL_MARKDOWN_CONTENT
      : testType === 'code'
        ? CODE_BLOCK_CONTENT
        : MERMAID_CONTENT
    setContent(testContent)
    setIsStreaming(false)
  }

  const getTestTypeLabel = () => {
    switch (currentTestType) {
      case 'full':
        return '完整内容'

      case 'code':
        return '代码块'

      case 'mermaid':
        return 'Mermaid 图表'

      default:
        return '未选择'
    }
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval)
      }
    }
  }, [streamInterval])

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* 控制面板 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">MDXRenderer 测试示例</h1>
          <p className="text-muted-foreground mt-2">
            演示动态 MDX 渲染器如何处理流式内容和各种 Markdown 语法元素
          </p>
        </div>

        {/* 测试类型选择 */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">选择测试内容</h3>

          {/* 流式传输按钮组 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">流式传输测试</div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isStreaming}
                variant="default"
                onClick={() => { startStreaming('full') }}
              >
                {isStreaming && currentTestType === 'full' ? '流式传输中...' : '完整内容流式传输'}
              </Button>
              <Button
                disabled={isStreaming}
                variant="default"
                onClick={() => { startStreaming('code') }}
              >
                {isStreaming && currentTestType === 'code' ? '流式传输中...' : '代码块流式传输'}
              </Button>
              <Button
                disabled={isStreaming}
                variant="default"
                onClick={() => { startStreaming('mermaid') }}
              >
                {isStreaming && currentTestType === 'mermaid' ? '流式传输中...' : 'Mermaid 流式传输'}
              </Button>
              {isStreaming && (
                <Button
                  variant="destructive"
                  onClick={stopStreaming}
                >
                  终止传输
                </Button>
              )}
            </div>
          </div>

          {/* 立即显示按钮组 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">立即显示测试</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => { showFullContent('full') }}
              >
                显示完整内容
              </Button>
              <Button
                variant="outline"
                onClick={() => { showFullContent('code') }}
              >
                显示代码块测试
              </Button>
              <Button
                variant="outline"
                onClick={() => { showFullContent('mermaid') }}
              >
                显示 Mermaid 测试
              </Button>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={resetContent}
            >
              重置内容
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="speed">
            流式速度:
          </label>
          <input
            className="w-32"
            disabled={isStreaming}
            id="speed"
            max="200"
            min="10"
            type="range"
            value={streamSpeed}
            onChange={(e) => { setStreamSpeed(Number(e.target.value)) }}
          />
          <span className="text-sm text-muted-foreground">
            {streamSpeed}ms/字符
          </span>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div>
            当前测试类型:
            <span className="font-medium">{getTestTypeLabel()}</span>
          </div>
          <div>
            当前内容长度: {content.length} / {getCurrentTestContent().length} 字符
            {isStreaming && (
              <span className="ml-2 inline-flex items-center">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-1" />
                流式传输中
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* 渲染结果 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">渲染结果</h2>
          <p className="text-muted-foreground">
            下方展示 MDXRenderer 的实时渲染效果
          </p>
        </div>

        <ProseContainer className="border rounded-lg p-4 min-h-[200px] bg-background">
          <MDXRenderer
            content={content}
          />

          {!content && !isStreaming && (
            <div className="text-center text-muted-foreground py-8">
              点击上方按钮开始测试 MDX 渲染
            </div>
          )}
        </ProseContainer>
      </div>

      <Separator />

      {/* 原始内容 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">原始 Markdown 内容</h2>
          <p className="text-muted-foreground">
            当前传入 MDXRenderer 的原始内容
          </p>
        </div>

        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap border">
          {content || '暂无内容'}
        </pre>
      </div>
    </div>
  )
}
