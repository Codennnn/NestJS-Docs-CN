/* eslint-disable no-console */
/**
 * Orama Cloud 索引同步脚本
 *
 * 读取所有 MDX 文档文件，按 H2 分段并清洗内容后，
 * 通过 @orama/core SDK 推送到 Orama Cloud 数据源。
 *
 * 使用方式：
 *   pnpm tsx scripts/sync-orama.ts
 *
 * 环境变量：
 *   ORAMA_PROJECT_ID       - Orama Cloud 项目 ID
 *   ORAMA_PRIVATE_API_KEY   - Orama Cloud 私有 API Key（写权限）
 *   ORAMA_DATASOURCE_ID     - 数据源 ID
 *   DRY_RUN                 - 设置为 'true' 时仅解析不推送（调试用）
 */

import { OramaCloud } from '@orama/core'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

import { type DocumentChunk, parseMdxFile } from './lib/mdx-parser'
import { buildNavMap, resolveDocMeta } from './lib/nav-resolver'

// 导入导航数据（使用动态导入以避免路径别名问题）
async function loadNavData() {
  // 直接读取 nav.ts 的导出数据
  const navModule = await import('../src/lib/data/nav')

  return navModule.navMainData
}

const DOCS_DIR = join(process.cwd(), 'src/content/docs')
const DRY_RUN = process.env.DRY_RUN === 'true'
const EXCLUDED_DOC_PATHS = new Set(['test'])
const MAX_BATCH_DOCS = 100
const MAX_BATCH_BYTES = 750_000
const RETRY_ATTEMPTS = 5
const RETRY_BASE_DELAY_MS = 2000

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

function toOramaDocuments(chunks: DocumentChunk[]): Record<string, unknown>[] {
  return chunks.map((chunk) => ({ ...chunk }))
}

function batchDocuments(documents: Record<string, unknown>[]): Record<string, unknown>[][] {
  const batches: Record<string, unknown>[][] = []
  let currentBatch: Record<string, unknown>[] = []
  let currentBatchBytes = 0

  for (const document of documents) {
    const documentBytes = Buffer.byteLength(JSON.stringify(document), 'utf8')
    const exceedsBatchLimit = currentBatch.length >= MAX_BATCH_DOCS
      || currentBatchBytes + documentBytes > MAX_BATCH_BYTES

    if (currentBatch.length > 0 && exceedsBatchLimit) {
      batches.push(currentBatch)
      currentBatch = []
      currentBatchBytes = 0
    }

    currentBatch.push(document)
    currentBatchBytes += documentBytes
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  return batches
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

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function withRetry<T>(operation: () => Promise<T>, description: string): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation()
    }
    catch (error) {
      lastError = error
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (attempt === RETRY_ATTEMPTS) {
        console.error(`   ❌ ${description} 最终失败（已重试 ${RETRY_ATTEMPTS} 次）: ${errorMessage}`)
        break
      }

      const delay = RETRY_BASE_DELAY_MS * attempt
      console.warn(`   ⚠️  ${description} 失败（第 ${attempt}/${RETRY_ATTEMPTS} 次）: ${errorMessage}，${delay}ms 后重试...`)
      await sleep(delay)
    }
  }

  throw lastError
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

  console.log(`✅ 解析完成：${allChunks.length} 个文档分段\n`)

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

  // 4. 推送到 Orama Cloud
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

  const projectId = process.env.ORAMA_PROJECT_ID
  const apiKey = process.env.ORAMA_PRIVATE_API_KEY
  const datasourceId = process.env.ORAMA_DATASOURCE_ID

  if (!projectId || !apiKey || !datasourceId) {
    console.error('❌ 缺少环境变量：ORAMA_PROJECT_ID, ORAMA_PRIVATE_API_KEY, ORAMA_DATASOURCE_ID')
    process.exit(1)
  }

  console.log('🚀 推送到 Orama Cloud...')

  const orama = new OramaCloud({ projectId, apiKey })
  const datasource = orama.dataSource(datasourceId)
  const temporaryDatasource = await withRetry(
    async () => datasource.createTemporaryIndex(),
    '创建临时索引',
  )
  const batchedDocuments = batchDocuments(toOramaDocuments(allChunks))

  console.log(`   📦 已生成 ${batchedDocuments.length} 个上传批次`)

  for (let index = 0; index < batchedDocuments.length; index++) {
    const batch = batchedDocuments[index]
    const batchNum = index + 1

    console.log(`   📦 推送批次 ${batchNum}/${batchedDocuments.length}（${batch.length} 个文档）...`)

    await withRetry(
      async () => temporaryDatasource.upsertDocuments(batch),
      `批次 ${batchNum}/${batchedDocuments.length} 上传`,
    )
  }

  console.log('🔄 切换临时索引...')
  await withRetry(
    async () => temporaryDatasource.swap(),
    '切换临时索引',
  )

  console.log(`\n✅ 同步完成！共推送 ${allChunks.length} 个文档分段`)
}

main().catch((error: unknown) => {
  console.error('❌ 同步失败:', error)
  process.exit(1)
})
