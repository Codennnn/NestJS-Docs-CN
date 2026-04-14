export interface SearchDocument {
  /** URL 路径（如 /docs/techniques/caching#缓存） */
  path?: string
  /** 页面标题（中文） */
  title?: string
  /** 英文标题 */
  titleEn?: string
  /** 当前章节标题（h2 级别） */
  heading?: string
  /** 当前章节锚点 */
  anchor?: string
  /** 清洗后的纯文本内容 */
  content?: string
  /** 所属大类（中文，如「入门指南」） */
  section?: string
  /** 父级分类（如 techniques、recipes） */
  category?: string
  /** 层级导航文本 */
  breadcrumbs?: string[]
  /** 是否为页面概述块 */
  isOverview?: boolean
  /** 章节在页面中的顺序 */
  order?: number
  /** 章节被切分后的分块序号 */
  chunkIndex?: number
  /** 章节被切分后的总块数 */
  chunkCount?: number
}

export interface SearchResult {
  id: string
  document?: SearchDocument
  score?: number
}
