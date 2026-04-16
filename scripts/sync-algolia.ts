/* eslint-disable no-console */
/**
 * Algolia 索引同步脚本
 *
 * 读取所有 MDX 文档文件，按 H2 分段并清洗内容后，
 * 通过 Algolia v5 SDK 推送到 Algolia 索引。
 *
 * 使用方式：
 *   pnpm tsx scripts/sync-algolia.ts
 *
 * 环境变量：
 *   NEXT_PUBLIC_ALGOLIA_APP_ID     - Algolia Application ID
 *   ALGOLIA_ADMIN_API_KEY          - Algolia Admin API Key（写权限）
 *   NEXT_PUBLIC_ALGOLIA_INDEX_NAME - 索引名称（可选，默认 nestjs_docs_cn）
 *   DRY_RUN                       - 设置为 'true' 时仅解析不推送（调试用）
 */

import { algoliasearch } from 'algoliasearch'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

import { type DocumentChunk, parseMdxFile } from './lib/mdx-parser'
import { buildNavMap, resolveDocMeta } from './lib/nav-resolver'

// 导入导航数据（使用动态导入以避免路径别名问题）
async function loadNavData() {
  const navModule = await import('../src/lib/data/nav')

  return navModule.navMainData
}

const DOCS_DIR = join(process.cwd(), 'src/content/docs')
const DRY_RUN = process.env.DRY_RUN === 'true'
const EXCLUDED_DOC_PATHS = new Set(['test'])
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'nestjs_docs_cn'

/**
 * 递归收集所有 MDX 文件路径
 */
async function collectMdxFiles(dirPath: string, basePath = ''): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dirPath)

  for (const entry of entries) {
    if (entry.startsWith('.')) {
      continue
    }

    const fullPath = join(dirPath, entry)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      const subFiles = await collectMdxFiles(fullPath, join(basePath, entry))
      files.push(...subFiles)
    }
    else if (entry.endsWith('.mdx')) {
      const fileName = entry.replace('.mdx', '')
      const filePath = basePath ? join(basePath, fileName) : fileName
      files.push(filePath)
    }
  }

  return files
}

/**
 * 将 DocumentChunk 转为 Algolia 记录（使用 objectID 作为唯一标识）
 */
function toAlgoliaRecords(chunks: DocumentChunk[]): Record<string, unknown>[] {
  return chunks.map((chunk) => ({
    objectID: chunk.id,
    title: chunk.title,
    titleEn: chunk.titleEn,
    heading: chunk.heading,
    anchor: chunk.anchor,
    content: chunk.content,
    path: chunk.path,
    section: chunk.section,
    category: chunk.category,
    breadcrumbs: chunk.breadcrumbs,
    isOverview: chunk.isOverview,
    order: chunk.order,
    pageOrder: chunk.pageOrder,
    sectionKey: chunk.sectionKey,
    chunkIndex: chunk.chunkIndex,
    chunkCount: chunk.chunkCount,
  }))
}

function validateUniqueChunkIds(chunks: DocumentChunk[]): void {
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()

  chunks.forEach((chunk) => {
    if (seenIds.has(chunk.id)) {
      duplicateIds.add(chunk.id)

      return
    }

    seenIds.add(chunk.id)
  })

  if (duplicateIds.size > 0) {
    throw new Error(`检测到重复的文档 ID：\n${Array.from(duplicateIds).join('\n')}`)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始解析文档...\n')

  // 1. 加载导航数据并构建映射
  const navData = await loadNavData()
  const navMap = buildNavMap(navData)
  console.log(`📋 导航映射：${navMap.size} 个条目`)

  // 2. 收集所有 MDX 文件
  const docPaths = await collectMdxFiles(DOCS_DIR)
  const filteredPaths = docPaths.filter((docPath) => !EXCLUDED_DOC_PATHS.has(docPath))
  console.log(`📄 找到 ${filteredPaths.length} 个文档文件\n`)

  // 3. 解析所有文档
  const allChunks: DocumentChunk[] = []
  const parseFailures: string[] = []

  for (const docPath of filteredPaths) {
    const filePath = join(DOCS_DIR, `${docPath}.mdx`)
    const meta = resolveDocMeta(navMap, docPath)

    try {
      const chunks = await parseMdxFile(filePath, docPath, meta)
      allChunks.push(...chunks)
    }
    catch (error) {
      console.warn(`⚠️  解析失败: ${docPath}`, error)
      parseFailures.push(docPath)
    }
  }

  if (parseFailures.length > 0) {
    throw new Error(`以下文档解析失败，已中止同步：\n${parseFailures.join('\n')}`)
  }

  if (allChunks.length === 0) {
    throw new Error('未生成任何文档分段，已拒绝执行同步。')
  }

  validateUniqueChunkIds(allChunks)

  // 统计信息
  const sections = new Map<string, number>()

  for (const chunk of allChunks) {
    sections.set(chunk.section, (sections.get(chunk.section) ?? 0) + 1)
  }

  console.log('📊 分段统计：')

  for (const [section, count] of sections) {
    console.log(`   ${section}: ${count} 个分段`)
  }

  console.log()

  // 4. 推送到 Algolia
  if (DRY_RUN) {
    console.log('🏃 Dry Run 模式 - 跳过推送')
    console.log(`   将推送 ${allChunks.length} 个文档分段`)

    // 输出前 3 个分段作为示例
    for (const chunk of allChunks.slice(0, 3)) {
      console.log(`\n   📄 ${chunk.id}`)
      console.log(`      标题: ${chunk.title} (${chunk.titleEn})`)
      console.log(`      章节: ${chunk.heading}`)
      console.log(`      跳转: ${chunk.path}`)
      console.log(`      分类: ${chunk.section} / ${chunk.category}`)
      console.log(`      内容: ${chunk.content.slice(0, 80)}...`)
    }

    return
  }

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY

  if (!appId || !adminApiKey) {
    console.error('❌ 缺少环境变量：NEXT_PUBLIC_ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY')
    process.exit(1)
  }

  console.log('🚀 推送到 Algolia...')

  const client = algoliasearch(appId, adminApiKey)
  const records = toAlgoliaRecords(allChunks)

  // 配置索引设置
  console.log('⚙️  更新索引设置...')
  const settingsResponse = await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        'unordered(title)',
        'unordered(heading)',
        'unordered(titleEn)',
        'unordered(breadcrumbs)',
        'unordered(content)',
      ],
      attributesForFaceting: [
        'filterOnly(section)',
        'filterOnly(category)',
        'filterOnly(isOverview)',
      ],
      attributeForDistinct: 'sectionKey',
      distinct: true,
      attributesToRetrieve: [
        'title', 'titleEn', 'heading', 'anchor',
        'path', 'section', 'category',
        'breadcrumbs', 'isOverview', 'order',
        'pageOrder', 'sectionKey', 'chunkIndex',
      ],
      attributesToHighlight: ['title', 'titleEn', 'heading'],
      attributesToSnippet: ['content:24'],
      snippetEllipsisText: '…',
      highlightPreTag: '<mark class="bg-theme/15 rounded-xs text-current">',
      highlightPostTag: '</mark>',
      queryLanguages: ['zh', 'en'],
      indexLanguages: ['zh', 'en'],
      customRanking: [
        'asc(pageOrder)',
        'desc(isOverview)',
        'asc(order)',
        'asc(chunkIndex)',
      ],
    },
  })
  await client.waitForTask({
    indexName: INDEX_NAME,
    taskID: settingsResponse.taskID,
  })

  // 使用 replaceAllObjects 原子替换所有记录
  console.log(`   📦 原子替换 ${records.length} 条记录...`)
  await client.replaceAllObjects({
    indexName: INDEX_NAME,
    objects: records,
    batchSize: 1000,
  })

  console.log(`\n✅ 同步完成！共推送 ${allChunks.length} 个文档分段到索引 "${INDEX_NAME}"`)
}

main().catch((error: unknown) => {
  console.error('❌ 同步失败:', error)
  process.exit(1)
})
