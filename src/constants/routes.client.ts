/**
 * 客户端安全路由常量
 *
 * 此文件定义了可在前端组件中安全使用的公开路由信息，
 * 不包含任何敏感的管理后台路径。
 *
 * ⚠️ 安全提醒：
 * 此文件的所有导出内容都会被打包到前端代码中，因此：
 * • 禁止在此文件中定义敏感的管理后台路由
 * • 敏感路由请统一在 routes.server.ts 中定义
 * • 仅导出公开、安全的路由常量
 */

/**
 * 公开页面路由
 */
export const PUBLIC_ROUTES = {
  /** 首页 */
  HOME: '/',
  /** 文档根路径 */
  DOCS: '/docs',
  /** 搜索页面 */
  SEARCH: '/search',
  /** 关于页面 */
  ABOUT: '/about',
  /** 测试页面 */
  TEST: '/test',
} as const

/**
 * 文档相关路由
 */
export const DOC_ROUTES = {
  /** 文档根路径 */
  ROOT: '/docs',
  /** 快速开始 */
  GETTING_STARTED: '/docs/getting-started',
  /** 基础概念 */
  FUNDAMENTALS: '/docs/fundamentals',
  /** 技术指南 */
  TECHNIQUES: '/docs/techniques',
} as const

/**
 * 静态资源公开路径（用于前端引用）
 */
export const PUBLIC_ASSETS = {
  /** Logo 图片路径 */
  LOGO: '/logos',
  /** 文档图片路径 */
  DOC_IMAGES: '/assets/doc-diagrams',
  /** 字体文件路径 */
  FONTS: '/assets/fonts',
} as const

/**
 * 外部链接
 */
export const EXTERNAL_LINKS = {
  /** GitHub 仓库 */
  GITHUB: 'https://github.com/nestjs/nest',
  /** 官方文档 */
  OFFICIAL_DOCS: 'https://docs.nestjs.com',
  /** Discord 社区 */
  DISCORD: 'https://discord.gg/G7Qnnhy',
} as const

/**
 * 导航相关常量
 */
export const NAVIGATION = {
  /** 主导航项目 */
  MAIN_NAV: ['docs', 'examples', 'community'] as const,
  /** 文档侧边栏最大深度 */
  SIDEBAR_MAX_DEPTH: 3,
} as const

export const enum RoutePath {
  Home = '/',
  Docs = '/docs',
}
