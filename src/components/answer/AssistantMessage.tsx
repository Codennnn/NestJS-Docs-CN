'use client'

import { memo, useMemo } from 'react'

import Link from 'next/link'
import type { Interaction } from '@orama/core'
import { BookOpenIcon, MessageSquarePlusIcon } from 'lucide-react'

import { MDXRenderer } from '~/components/mdx/MDXRenderer'
import { ProseContainer } from '~/components/ProseContainer'
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import type { SearchDocument } from '~/types/doc'

interface Source {
  document: SearchDocument
}

interface AssistantMessageProps {
  content: string
  interaction?: Interaction
  onRelatedQuestionClick: (question: string) => void
}

// 相关来源组件
interface SourcesListProps {
  sources: Source[]
}

const SourcesList = memo(function SourcesList(props: SourcesListProps) {
  const { sources } = props

  if (sources.length === 0) {
    return null
  }

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="text-xs font-medium mb-1 flex items-center gap-1">
        <BookOpenIcon className="size-2.5" />
        参考：
      </div>
      <div className="space-y-0.5">
        {sources.map((hit: Source, sourceIdx: number) => (
          <Link
            key={sourceIdx}
            className="block text-xs text-blue-500 hover:underline text-left"
            href={hit.document.path ?? '#'}
          >
            {hit.document.title}
          </Link>
        ))}
      </div>
    </div>
  )
})

// 相关问题组件
interface RelatedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

const RelatedQuestions = memo(function RelatedQuestions(props: RelatedQuestionsProps) {
  const { questions, onQuestionClick } = props

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="font-medium mb-1.5">相关问题：</div>

      <TooltipProvider closeDelay={0} delay={200}>
        <div className="space-y-0.5">
          {questions.map((query: string, queryIdx: number) => (
            <div
              key={queryIdx}
              className="flex items-center justify-start gap-1 text-[0.8em] text-blue-500 hover:underline underline-offset-2 group/question cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => {
                onQuestionClick(query)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onQuestionClick(query)
                }
              }}
            >
              {query}

              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <MessageSquarePlusIcon className="size-[1em] opacity-0 group-hover/question:opacity-100 transition-opacity" />
                </TooltipTrigger>
                <TooltipPopup>
                  添加到提问
                </TooltipPopup>
              </Tooltip>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
})

/**
 * 解析 Interaction.related 字段为相关问题数组
 *
 * 新 API 中 related 为 Nullable<string>，可能是：
 * - JSON 数组字符串：'["问题1", "问题2"]'
 * - 换行分隔的文本
 * - null
 */
function parseRelatedQuestions(related: string | null): string[] {
  if (!related) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(related)

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
  }
  catch {
    // 非 JSON 格式，按换行分隔处理
  }

  return related
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function extractSourceHits(
  sources: Interaction['sources'] | null | undefined,
): Source[] {
  if (Array.isArray(sources)) {
    return sources as Source[]
  }

  if (sources && typeof sources === 'object' && 'hits' in sources && Array.isArray(sources.hits)) {
    return sources.hits as Source[]
  }

  return []
}

export function AssistantMessage(props: AssistantMessageProps) {
  const { content, interaction, onRelatedQuestionClick } = props

  const hits = useMemo(
    () => extractSourceHits(interaction?.sources ?? null),
    [interaction?.sources],
  )

  const relatedQueries = useMemo(
    () => parseRelatedQuestions(interaction?.related ?? null),
    [interaction?.related],
  )

  const errorMessage = interaction?.error
    ? interaction.errorMessage ?? '回答生成失败，请稍后重试。'
    : null

  return (
    <ProseContainer className="prose-sm">
      <MDXRenderer content={content} />

      {errorMessage && (
        <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive not-prose">
          {errorMessage}
        </div>
      )}

      {/* 显示相关来源 */}
      <SourcesList
        sources={hits}
      />

      {/* 显示相关问题 */}
      <RelatedQuestions
        questions={relatedQueries}
        onQuestionClick={onRelatedQuestionClick}
      />
    </ProseContainer>
  )
}
