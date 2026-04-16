// 格式化文档路径
export function formatDocumentPath(path: string): string {
  if (!path) {
    return ''
  }

  return path.replace(/^\//, '').replace(/\.mdx?$/, '')
}
