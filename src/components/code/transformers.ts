import { transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
// import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from 'shiki'

/**
 * 标准化代码格式的 transformer
 *
 * 包含多种代码预处理功能：
 * - 移除尾随换行符
 * - 统一换行符格式
 * - 移除行尾空格
 */
function transformerNormalizeCode(): ShikiTransformer {
  return {
    name: 'normalize-code',
    preprocess(code) {
      return code
        // 统一换行符为 \n
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // 移除行尾空格
        .replace(/[ \t]+$/gm, '')
        // 移除末尾的换行符
        .replace(/\n+$/, '')
    },
  }
}

/**
 * 代码高亮配置选项
 */
export interface CodeHighlightOptions {
  /** 编程语言 */
  lang: BundledLanguage
  /** 代码内容 */
  code: string
  /** 是否显示行号，默认不显示 */
  showLineNumbers?: boolean
  /** 是否启用 twoslash 转换，默认不启用 */
  enableTwoslash?: boolean
}

/**
 * 统一的代码高亮处理函数
 *
 * 整合了 ClientCodeBlock 和 CodeBlock 中重复的 codeToHtml 逻辑：
 * 1. 统一的 transformer 配置
 * 2. 统一的主题配置
 * 3. 可配置的功能选项
 *
 * @param options 代码高亮配置选项
 * @returns 高亮后的 HTML 字符串
 */
export async function highlightCode(options: CodeHighlightOptions): Promise<string> {
  const {
    code,
    lang,
    showLineNumbers = false,
    enableTwoslash = false,
  } = options

  // 基础 transformers 配置
  const transformers: ShikiTransformer[] = [
    transformerNormalizeCode(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
  ]

  // 可选的行号显示功能
  if (showLineNumbers) {
    transformers.push({ name: 'line-numbers' })
  }

  // 可选的 twoslash 转换功能
  if (enableTwoslash) {
    // transformers.push(transformerTwoslash())
  }

  // 执行代码高亮
  const htmlOutput = await codeToHtml(code, {
    lang,
    transformers,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })

  return htmlOutput
}
