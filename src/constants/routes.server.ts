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
} as const
