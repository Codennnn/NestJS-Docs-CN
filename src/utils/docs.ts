import { readdir, stat } from 'fs/promises'
import { join } from 'node:path'

export { getDocNavigation, getDocTitle, getDocTitleFromNav } from './docs.client'

/**
 * 递归获取所有 MDX 文件路径
 */
async function getAllMdxFiles(dirPath: string, basePath = ''): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await readdir(dirPath)

    for (const entry of entries) {
      if (entry.startsWith('.')) {
        continue // 跳过隐藏文件
      }

      const fullPath = join(dirPath, entry)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        // 递归处理子目录
        const subFiles = await getAllMdxFiles(fullPath, join(basePath, entry))
        files.push(...subFiles)
      }
      else if (entry.endsWith('.mdx')) {
        // 移除 .mdx 扩展名，构建路径
        const fileName = entry.replace('.mdx', '')
        const filePath = basePath ? join(basePath, fileName) : fileName
        files.push(filePath)
      }
    }
  }
  catch (error) {
    console.warn(`无法读取目录 ${dirPath}:`, error)
  }

  return files
}

/**
 * 获取所有文档路径，用于静态生成
 */
export async function getAllDocPaths(): Promise<string[]> {
  // 在构建时，使用项目根目录的相对路径
  const docsDir = join(process.cwd(), 'src/content/docs')

  try {
    const paths = await getAllMdxFiles(docsDir)

    // 过滤掉空路径和特殊文件
    return paths.filter((path) => path && !path.includes('test') && !path.includes('.DS_Store'))
  }
  catch (error) {
    console.error('获取文档路径失败:', error)

    // 如果获取失败，返回一些基本路径
    return [
      'introduction',
      'first-steps',
      'controllers',
      'providers',
      'modules',
    ]
  }
}
