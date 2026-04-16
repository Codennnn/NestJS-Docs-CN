/**
 * 导航元数据解析工具
 *
 * 从 nav.ts 的导航数据中构建 URL → 元数据（title/titleEn/section/category）的映射，
 * 供同步脚本在解析 MDX 文件时关联精确的中英文标题和分类信息。
 */

interface NavMenuItem {
  title?: string
  titleEn?: string
  url?: string
  items?: NavMenuItem[]
  hiddenInSidebar?: boolean
  defaultOpen?: boolean
}

export interface DocMeta {
  /** 中文标题 */
  title: string
  /** 英文标题 */
  titleEn: string
  /** 所属大类中文名（如「入门指南」「功能扩展」） */
  section: string
  /** 路径分类（如 techniques、recipes） */
  category: string
  /** 页面在导航中的全局顺序 */
  pageOrder: number
}

/**
 * 从 URL 路径中提取 category
 *
 * 例：'/techniques/caching' → 'techniques'
 *     '/introduction' → 'general'
 */
function extractCategory(url: string): string {
  const parts = url.replace(/^\//, '').split('/')

  if (parts.length > 1) {
    return parts[0]
  }

  return 'general'
}

/**
 * 递归遍历导航项，构建 URL → DocMeta 映射
 */
function traverseNavItems(
  items: NavMenuItem[],
  sectionTitle: string,
  map: Map<string, DocMeta>,
  pageOrderRef: { value: number },
): void {
  for (const item of items) {
    if (item.url && !item.url.startsWith('http')) {
      // 将 URL 转换为文件路径格式（去掉前导 /）
      const docPath = item.url.replace(/^\//, '')

      map.set(docPath, {
        title: item.title ?? '',
        titleEn: item.titleEn ?? '',
        section: sectionTitle,
        category: extractCategory(item.url),
        pageOrder: pageOrderRef.value++,
      })
    }

    if (item.items) {
      // 子菜单继承父级的 section（大类）
      traverseNavItems(item.items, sectionTitle, map, pageOrderRef)
    }
  }
}

/**
 * 从导航数据构建完整的 docPath → DocMeta 映射
 *
 * @param navData 导航菜单数据（navMainData）
 * @returns Map<docPath, DocMeta>
 */
export function buildNavMap(navData: NavMenuItem[]): Map<string, DocMeta> {
  const map = new Map<string, DocMeta>()
  const pageOrderRef = { value: 0 }

  for (const section of navData) {
    const sectionTitle = section.title ?? ''

    // 处理有直接 URL 的顶级菜单（如「迁移指南」）
    if (section.url && !section.url.startsWith('http')) {
      const docPath = section.url.replace(/^\//, '')
      map.set(docPath, {
        title: section.title ?? '',
        titleEn: section.titleEn ?? '',
        section: sectionTitle,
        category: extractCategory(section.url),
        pageOrder: pageOrderRef.value++,
      })
    }

    // 递归处理子菜单
    if (section.items) {
      traverseNavItems(section.items, sectionTitle, map, pageOrderRef)
    }
  }

  return map
}

/**
 * 根据文件路径查找元数据，找不到时返回默认值
 */
export function resolveDocMeta(
  navMap: Map<string, DocMeta>,
  docPath: string,
): DocMeta {
  const meta = navMap.get(docPath)

  if (meta) {
    return meta
  }

  // 回退：从路径推断 category
  const category = extractCategory(`/${docPath}`)

  return {
    title: '',
    titleEn: '',
    section: '未分类',
    category,
    pageOrder: Number.MAX_SAFE_INTEGER,
  }
}
