import { readFile } from 'node:fs/promises'

export interface DocumentChunk {
  /** 文档唯一标识（路径#锚点） */
  id: string
  /** 页面标题（中文） */
  title: string
  /** 英文标题 */
  titleEn: string
  /** 当前章节标题（h2 级别） */
  heading: string
  /** 当前章节锚点（概述块为空） */
  anchor: string
  /** 清洗后的纯文本内容 */
  content: string
  /** URL 路径 */
  path: string
  /** 所属大类（中文，如「入门指南」） */
  section: string
  /** 父级分类（如 techniques、recipes） */
  category: string
  /** 层级路径信息，便于过滤和辅助排序 */
  breadcrumbs: string[]
  /** 是否为页面概述块 */
  isOverview: boolean
  /** 章节在页面中的顺序 */
  order: number
  /** 当前章节切块后的序号 */
  chunkIndex: number
  /** 当前章节切块后的总数 */
  chunkCount: number
}

interface ParsedSection {
  heading: string
  body: string
  isOverview: boolean
  order: number
}

/**
 * 从 MDX 文件中提取 H1 标题
 */
function extractH1(content: string): string {
  const match = /^#\s+(.+)$/m.exec(content)

  return match ? match[1].trim() : ''
}

/**
 * 清洗 MDX 内容，移除代码块、JSX 组件、import 语句等
 */
function cleanContent(raw: string): string {
  let text = raw

  // 移除 import 语句
  text = text.replace(/^import\s+.*$/gm, '')

  // 移除围栏代码块（```...```）
  text = text.replace(/```[\s\S]*?```/g, '')

  // 移除行内代码（保留内容）
  text = text.replace(/`([^`]+)`/g, '$1')

  // 移除自闭合 JSX 标签（如 <DocImage ... />）
  text = text.replace(/<[A-Z]\w*\s+[^>]*\/>/g, '')

  // 移除成对 JSX 标签及其内容（如 <FileTree>...</FileTree>）
  text = text.replace(/<([A-Z]\w*)[\s\S]*?<\/\1>/g, '')

  // 移除自闭合 JSX 标签（无属性，如 <Component />）
  text = text.replace(/<[A-Z]\w*\s*\/>/g, '')

  // 移除 HTML 注释
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // 移除 Markdown 图片
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // 保留 Markdown 链接文本
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 移除标题标记（# ## 等），但保留文本
  text = text.replace(/^#{1,6}\s+/gm, '')

  // 移除 Markdown 加粗/斜体标记
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')

  // 压缩多余空行为单个换行
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

/**
 * 将 heading 文本转为基础 URL 锚点
 */
function headingToBaseAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 创建文档内唯一锚点生成器
 *
 * rehype-slug 会对重复标题追加 -1/-2 后缀；这里保持同样的唯一性规则，
 * 避免同一文档内多个同名 H2 覆盖到相同的索引 ID。
 */
function createHeadingAnchorGenerator(reservedHeadings: string[] = []) {
  const occurrences = new Map<string, number>()

  reservedHeadings
    .map((heading) => headingToBaseAnchor(heading))
    .filter(Boolean)
    .forEach((anchor) => {
      occurrences.set(anchor, 0)
    })

  return (heading: string): string => {
    const baseAnchor = headingToBaseAnchor(heading) || 'section'
    const existingCount = occurrences.get(baseAnchor)

    if (existingCount === undefined) {
      occurrences.set(baseAnchor, 0)

      return baseAnchor
    }

    const nextCount = existingCount + 1
    occurrences.set(baseAnchor, nextCount)

    return `${baseAnchor}-${nextCount}`
  }
}

function splitLongParagraph(paragraph: string, maxLength: number): string[] {
  if (paragraph.length <= maxLength) {
    return [paragraph]
  }

  const sentences = paragraph
    .split(/(?<=[。！？.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (sentences.length <= 1) {
    const parts: string[] = []

    for (let index = 0; index < paragraph.length; index += maxLength) {
      parts.push(paragraph.slice(index, index + maxLength).trim())
    }

    return parts
  }

  const parts: string[] = []
  let currentPart = ''

  for (const sentence of sentences) {
    if (!currentPart) {
      currentPart = sentence
      continue
    }

    if (`${currentPart} ${sentence}`.length > maxLength) {
      parts.push(currentPart)
      currentPart = sentence
      continue
    }

    currentPart = `${currentPart} ${sentence}`
  }

  if (currentPart) {
    parts.push(currentPart)
  }

  return parts.flatMap((part) => splitLongParagraph(part, maxLength))
}

/**
 * 将过长章节按段落二次切分，避免单块内容过大。
 */
function splitLargeContent(content: string, maxLength = 1600): string[] {
  if (content.length <= maxLength) {
    return [content]
  }

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) => splitLongParagraph(paragraph, maxLength))

  if (paragraphs.length === 0) {
    return [content]
  }

  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (!currentChunk) {
      currentChunk = paragraph
      continue
    }

    if (`${currentChunk}\n\n${paragraph}`.length > maxLength) {
      chunks.push(currentChunk)
      currentChunk = paragraph
      continue
    }

    currentChunk = `${currentChunk}\n\n${paragraph}`
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks.length > 0 ? chunks : [content]
}

/**
 * 按 H2 标题将 MDX 内容分段
 *
 * 每个分段包含一个 h2 标题及其下方的所有内容（直到下一个 h2 或文件结尾）。
 * H1 之后、第一个 H2 之前的内容归入「概述」分段。
 */
export function splitByH2(content: string): ParsedSection[] {
  const lines = content.split(/\r?\n/)
  const sections: ParsedSection[] = []

  let currentHeading = '概述'
  let currentBodyLines: string[] = []
  let currentIsOverview = true
  let h1Skipped = false
  let inCodeFence = false

  const pushSection = () => {
    const body = currentBodyLines.join('\n').trim()

    if (!body) {
      currentBodyLines = []

      return
    }

    sections.push({
      heading: currentHeading,
      body,
      isOverview: currentIsOverview,
      order: sections.length,
    })

    currentBodyLines = []
  }

  for (const line of lines) {
    if (!h1Skipped && /^#\s+.+$/.test(line)) {
      h1Skipped = true
      continue
    }

    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence
      currentBodyLines.push(line)
      continue
    }

    if (!inCodeFence) {
      const headingMatch = /^##\s+(.+)$/.exec(line)

      if (headingMatch) {
        pushSection()
        currentHeading = headingMatch[1].trim()
        currentIsOverview = false
        continue
      }
    }

    currentBodyLines.push(line)
  }

  pushSection()

  return sections
}

/**
 * 读取并解析 MDX 文件，返回分段后的文档块
 */
export async function parseMdxFile(
  filePath: string,
  docPath: string,
  meta: { title: string, titleEn: string, section: string, category: string },
): Promise<DocumentChunk[]> {
  const raw = await readFile(filePath, 'utf-8')
  const h1 = extractH1(raw)
  const title = meta.title || h1 || docPath
  const sections = splitByH2(raw)
  const createAnchor = createHeadingAnchorGenerator([h1 || title])

  const chunks: DocumentChunk[] = []

  sections.forEach((section) => {
    const cleanedContent = cleanContent(section.body)

    // 跳过内容过短的分段（可能是空的或仅含标签）
    if (cleanedContent.length < 10) {
      return
    }

    const anchor = section.isOverview ? '' : createAnchor(section.heading)
    const contentChunks = splitLargeContent(cleanedContent)
    const breadcrumbs = [
      meta.section,
      meta.category,
      title,
      section.heading,
    ].filter(Boolean)

    contentChunks.forEach((content, chunkIndex) => {
      const chunkSuffix = contentChunks.length > 1 ? `::${chunkIndex + 1}` : ''
      const chunkAnchor = anchor || '__overview'

      chunks.push({
        id: `${docPath}#${chunkAnchor}${chunkSuffix}`,
        title,
        titleEn: meta.titleEn,
        heading: section.heading,
        anchor,
        content,
        path: anchor ? `/docs/${docPath}#${anchor}` : `/docs/${docPath}`,
        section: meta.section,
        category: meta.category,
        breadcrumbs,
        isOverview: section.isOverview,
        order: section.order,
        chunkIndex,
        chunkCount: contentChunks.length,
      })
    })
  })

  return chunks
}
