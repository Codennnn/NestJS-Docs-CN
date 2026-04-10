/**
 * 服务端专用路由常量定义
 * 仅在服务端代码（middleware、API routes、服务端组件）中使用
 * 不会被打包到前端，确保敏感路由路径的安全性
 */

/**
 * 静态资源相关路由（服务端处理）
 */
export const ASSET_ROUTES = {
  /** 静态资源根路径 */
  ROOT: '/assets',
  /** 防盗链警告图片 */
  HOTLINK_WARNING: '/assets/hotlink-warning.png',
} as const

/**
 * 受保护的文件扩展名匹配模式
 */
export const PROTECTED_FILE_EXTENSIONS = /\.(jpg|jpeg|png|gif|bmp|ico|svg|webp)$/i

/**
 * 搜索引擎爬虫用户代理匹配模式
 */
export const SEARCH_BOT_PATTERN = /googlebot|bingbot|baiduspider|yandexbot|duckduckbot/i

/**
 * 生产环境站点域名
 * 通过环境变量注入，支持多环境部署，避免在源码中硬编码生产域名
 * 在 .env.example 中配置 NEXT_PUBLIC_SITE_DOMAIN 占位符
 */
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'localhost'

/**
 * 允许的域名列表（防盗链配置）
 * 静态部分：本地开发地址 + 主流搜索引擎 + 社交平台
 * 动态部分：生产站点域名从环境变量读取
 */
export const ALLOWED_DOMAINS = [
  // 本地开发
  'localhost',
  '127.0.0.1',

  // 生产站点（由环境变量 NEXT_PUBLIC_SITE_DOMAIN 决定）
  SITE_DOMAIN,

  // 搜索引擎
  'google.com',
  'bing.com',
  'baidu.com',
  'yandex.com',
  'duckduckgo.com',

  // 社交媒体
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'weibo.com',
  'zhihu.com',
] as const
