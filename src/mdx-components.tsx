import Link from 'next/link'
import { BookOpenTextIcon, HashIcon } from 'lucide-react'
import type { MDXComponents } from 'mdx/types'
import type { BundledLanguage } from 'shiki'

import { CodeBlock } from '~/components/code/CodeBlock'
import { CodeTab, CodeTabs } from '~/components/code/CodeTabs'
import { CodeWrapper } from '~/components/code/CodeWrapper'
import { CalloutInfo } from '~/components/doc/CalloutInfo'
import { DocImage } from '~/components/doc/DocImage'
import { FileTree } from '~/components/doc/FileTree'
import { MermaidWrapper } from '~/components/doc/MermaidWrapper'
import { SpacingWrapper } from '~/components/doc/SpacingWrapper'
import { LinkIcon } from '~/components/LinkIcon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { getDocLinkHref, isExternalLink, isHashLink } from '~/utils/link'

interface PreProps {
  children: React.ReactElement<{ className?: string, children: React.ReactElement | string }>
  filename?: string
  title?: string
  showLineNumbers?: boolean
  hideInDoc?: boolean
}

interface AnchorProps {
  children: React.ReactElement
  href: string
}

interface HeadingProps {
  children: React.ReactNode
  id?: string
}

/**
 * 创建自定义标题组件，带有锚点链接功能
 */
const createHeadingComponent = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
  return function HeadingComponent(
    props: React.PropsWithChildren<HeadingProps> & React.ComponentProps<typeof Tag>,
  ) {
    const { id, children, ...restProps } = props

    if (!id) {
      return <Tag {...restProps}>{children}</Tag>
    }

    return (
      <Tag id={id} {...restProps}>
        <span className="group relative">
          {children}

          <span
            className={
              cn(
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-full',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline',
                'px-1.5 inline-flex items-center justify-center',
              )
            }
          >
            <Link
              aria-label={`链接到 ${typeof children === 'string' ? children : '此标题'}`}
              className="rounded-[0.25em] hover:bg-muted p-[0.2em] opacity-60 hover:opacity-100 transition-all duration-200"
              href={`#${id}`}
            >
              <HashIcon className="size-[0.8em]" />
            </Link>
          </span>
        </span>
      </Tag>
    )
  }
}

/**
 * 自定义 MDX 组件渲染函数
 *
 * 该函数用于扩展和重写 MDX 文档中的默认组件渲染行为，在 NestJS 中文文档项目中，此函数确保了文档中的代码示例和链接能够正确且一致地渲染
 *
 * @param components - 基础 MDX 组件集合，会与自定义组件合并
 * @returns 增强后的 MDX 组件集合
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: (props: AnchorProps) => {
      const { href, children } = props

      const isExternal = isExternalLink(href)
      const isHash = isHashLink(href)

      return (
        <Link
          className="inline-flex items-center gap-1 px-0.5"
          href={getDocLinkHref(href)}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}

          <span className="shrink-0 pr-0.5">
            {isExternal
              ? <LinkIcon link={href} />
              : isHash
                ? <HashIcon className="size-[0.9em]" />
                : <BookOpenTextIcon className="size-[0.9em]" />}
          </span>
        </Link>
      )
    },

    pre: (props: PreProps) => {
      const {
        children,
        filename,
        title,
        showLineNumbers = false,
        hideInDoc = false,
        ...restProps
      } = props

      if (children.type === 'code') {
        if (hideInDoc) {
          return null
        }

        const { className, children: codeContent } = children.props

        // 当代码块没有语言标识时，className 为 undefined，用可选链防止 replace 报错
        const lang = (className?.replace(/language-/, '') || 'text') as BundledLanguage

        if (typeof codeContent === 'string') {
          if (lang === 'mermaid') {
            return (
              <SpacingWrapper>
                <MermaidWrapper chart={codeContent} />
              </SpacingWrapper>
            )
          }

          return (
            <SpacingWrapper>
              <CodeBlock
                code={codeContent}
                filename={filename}
                lang={lang}
                showLineNumbers={showLineNumbers}
                title={title}
              />
            </SpacingWrapper>
          )
        }
      }

      return (
        <CodeWrapper>
          <pre {...restProps}>{children}</pre>
        </CodeWrapper>
      )
    },

    table: (props: React.ComponentProps<'table'>) => {
      return (
        <SpacingWrapper>
          <Table>
            {props.children}
          </Table>
        </SpacingWrapper>
      )
    },

    thead: (props: React.ComponentProps<'thead'>) => {
      return (
        <TableHeader>
          {props.children}
        </TableHeader>
      )
    },

    tbody: (props: React.ComponentProps<'tbody'>) => {
      return (
        <TableBody>
          {props.children}
        </TableBody>
      )
    },

    tr: (props: React.ComponentProps<'tr'>) => {
      return (
        <TableRow className="border-border">
          {props.children}
        </TableRow>
      )
    },

    th: (props: React.ComponentProps<'th'>) => {
      return (
        <TableHead>
          {props.children}
        </TableHead>
      )
    },

    td: (props: React.ComponentProps<'td'>) => {
      return (
        <TableCell>
          {props.children}
        </TableCell>
      )
    },

    // 自定义标题组件，带有锚点链接功能
    h1: createHeadingComponent('h1'),
    h2: createHeadingComponent('h2'),
    h3: createHeadingComponent('h3'),
    h4: createHeadingComponent('h4'),
    h5: createHeadingComponent('h5'),
    h6: createHeadingComponent('h6'),

    FileTree,
    CalloutInfo,
    DocImage,
    CodeTabs,
    CodeTab,

    ...components,
  }
}
