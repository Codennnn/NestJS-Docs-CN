const SITE_DESCRIPTION = 'NestJS 中文文档，高质量的中文翻译版本，精准还原官方内容，助力中文开发者轻松掌握高效、可靠且可扩展的 Node.js 框架。'
const DEFAULT_SITE_URL = 'http://localhost:8080'

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL

  return siteUrl.replace(/\/+$/, '')
}

// 网站配置常量
export const SITE_CONFIG = {
  // 基础 URL
  baseUrl: getSiteUrl(),

  // 网站信息
  name: 'NestJS 中文文档',
  title: 'NestJS - 渐进式 Node.js 框架',
  description: SITE_DESCRIPTION,

  // 作者和发布者信息
  author: 'NestJS 中文文档团队',
  publisher: 'NestJS 中文文档',

  // 相关链接
  englishDocsUrl: 'https://docs.nestjs.com',
  faviconPath: '/favicon.ico',
  logo32Path: '/logos/logo-32.png',
  logoPath: '/logos/logo-128.png',
  logo192Path: '/logos/logo-192.png',
  logo512Path: '/logos/logo-512.png',
  appTouchIconPath: '/logos/apple-touch-icon.png',
  manifestPath: '/manifest.webmanifest',

  og: {
    img: 'https://cdn.jsdelivr.net/gh/Codennnn/assets@main/i/og/nestjs-docs.png',
    description: SITE_DESCRIPTION,
  },

  // 语言配置
  locale: 'zh-CN',
  language: 'zh_CN',
} as const
