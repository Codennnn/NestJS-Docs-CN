import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // 添加这个配置以支持 Docker standalone 输出
  output: 'standalone',

  serverExternalPackages: ['@shikijs/twoslash'],

  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // 添加安全头和缓存策略
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        // 为所有页面添加 SEO 相关的安全头
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // HTTP Link 头的 preconnect 提示，让支持 103 Early Hints 的 CDN/代理
            // (如 Cloudflare) 能在页面 HTML 返回之前就开始建立与字体 CDN 的连接
            key: 'Link',
            value: '<https://cdn.leoku.dev>; rel=preconnect; crossorigin',
          },
        ],
      },
      {
        // 为所有静态资源添加安全头
        source: '/assets/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ]
  },

  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 明确列出允许被 Next.js 图片优化服务代理的远程主机
    // 避免使用 hostname: '**'，防止被滥用为开放代理（SSRF 风险）
    remotePatterns: [
      {
        // 项目自有 CDN
        protocol: 'https',
        hostname: 'cdn.leoku.dev',
      },
      {
        // NestJS 官方文档图片资源
        protocol: 'https',
        hostname: 'docs.nestjs.com',
      },
      {
        // GitHub 用户内容（Markdown 文档中常见）
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },

  // 压缩配置
  compress: true,

  // 启用实验性功能
  experimental: {
    // 优化字体加载
    optimizePackageImports: ['lucide-react', '@orama/core'],
  },

  // 性能优化
  poweredByHeader: false, // 移除 X-Powered-By 头
}

// Turbopack 无法将 JavaScript 函数传递给 Rust 编译器，
// 因此 remark/rehype 插件必须使用字符串名称而非导入的对象实例
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-mdx-code-props', 'rehype-slug'],
  },
})

export default withMDX(nextConfig)
