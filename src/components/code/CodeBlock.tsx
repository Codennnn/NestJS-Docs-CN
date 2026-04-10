import { type BundledLanguage } from 'shiki'

import { CodeContainer } from '~/components/code/CodeContainer'

import { highlightCode } from './transformers'

interface CodeBlockProps {
  /** 代码字符串 */
  code: string
  /** 代码语言类型 */
  lang: BundledLanguage
  /** 文件名（可选） */
  filename?: string
  /** 标题（可选） */
  title?: string
  /** 是否显示行号（可选，默认值为 true） */
  showLineNumbers?: boolean
}

export async function CodeBlock(props: CodeBlockProps) {
  const { code, lang, filename, title, showLineNumbers } = props

  const htmlOutput = await highlightCode({
    code,
    lang,
    showLineNumbers,
    enableTwoslash: true,
  })

  return (
    <CodeContainer
      code={code}
      filename={filename}
      lang={lang}
      title={title}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlOutput }}
      />
    </CodeContainer>
  )
}
