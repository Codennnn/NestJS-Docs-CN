import type { Metadata } from 'next'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'

import { StructuredData } from '~/components/StructuredData'
import { ThemeProvider } from '~/components/ThemeProvider'
import { SITE_CONFIG } from '~/constants/common'
import { getPageTitle } from '~/utils/common'
import { isProduction } from '~/utils/platform'

import '~/styles/global.css'

// 需要预加载的关键字体（首屏可见文本使用的字重）
// 其余字重由浏览器按需加载，无需全部 preload
const PRELOAD_FONTS = [
  // vivoSans Regular —— body 默认字重，对 LCP 影响最大
  'https://cdn.leoku.dev/fonts/vivo-sans/v1/regular.woff2',
  // MapleMono Regular —— 代码块首屏渲染所需
  'https://cdn.leoku.dev/fonts/maple-mono/v1/regular.woff2',
] as const

export const metadata: Metadata = {
  title: getPageTitle(),
  description: SITE_CONFIG.description,
  icons: {
    icon: [
      { url: SITE_CONFIG.faviconPath, sizes: 'any', type: 'image/x-icon' },
      { url: SITE_CONFIG.logo32Path, sizes: '32x32', type: 'image/png' },
      { url: SITE_CONFIG.logoPath, sizes: '128x128', type: 'image/png' },
    ],
    shortcut: [{ url: SITE_CONFIG.faviconPath, type: 'image/x-icon' }],
    apple: [{ url: SITE_CONFIG.appTouchIconPath, sizes: '180x180', type: 'image/png' }],
  },
  keywords: ['NestJS', 'Node.js', 'TypeScript', '后端框架', '中文文档', 'JavaScript', 'Express', 'Fastify', '微服务', 'GraphQL', 'REST API'],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  alternates: {
    canonical: SITE_CONFIG.baseUrl,
    languages: {
      'zh-CN': SITE_CONFIG.baseUrl,
      en: SITE_CONFIG.englishDocsUrl,
    },
  },
  manifest: SITE_CONFIG.manifestPath,
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.og.description,
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.language,
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.og.img,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.og.description,
    images: [SITE_CONFIG.og.img],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 添加搜索引擎验证（需要时取消注释并填入实际值）
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
    // baidu: 'your-baidu-verification-code',
  },
}

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning className="h-full" lang="zh-CN">
      {/* 预加载首屏关键字体，降低 LCP 和 CLS */}
      <head>
        {PRELOAD_FONTS.map((href) => (
          <link
            key={href}
            as="font"
            crossOrigin="anonymous"
            href={href}
            rel="preload"
            type="font/woff2"
          />
        ))}
        {/* 提前与 CDN 建立连接，减少后续字体请求的 DNS+TLS 耗时 */}
        <link
          crossOrigin="anonymous"
          href="https://cdn.leoku.dev"
          rel="preconnect"
        />
      </head>

      <body className="h-full antialiased font-sans">
        <NextTopLoader
          color="var(--primary)"
          height={2}
          shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
          showSpinner={false}
        />

        <StructuredData
          description={SITE_CONFIG.description}
          title={SITE_CONFIG.title}
          type="website"
          url={SITE_CONFIG.baseUrl}
        />

        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          {props.children}
        </ThemeProvider>

        {/*
          Umami 网站分析脚本
          - 用于收集网站访问数据和用户行为分析
          - 使用 Next.js Script 组件优化加载性能
          - strategy="afterInteractive" 确保在页面交互就绪后加载，不阻塞渲染
          - data-website-id 是 Umami 分配的唯一网站标识符
          - 隐私友好的 Google Analytics 替代方案
          - 仅在生产环境中加载，避免开发环境的访问数据污染
        */}
        {isProduction() && (
          <Script
            data-website-id="17a93541-f99f-43ed-8d7c-3887b4e85693"
            src="https://cloud.umami.is/script.js"
            strategy="afterInteractive"
          />
        )}
        <Analytics />
      </body>
    </html>
  )
}
