import { Suspense } from 'react'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { consola } from 'consola'

import { DocNavigation } from '~/components/doc/DocNavigation'
import { DocLoadingSkeleton } from '~/components/DocLoadingSkeleton'
import { ProseContainer } from '~/components/ProseContainer'
import { StructuredData } from '~/components/StructuredData'
import { SITE_CONFIG } from '~/constants/common'
import { RoutePath } from '~/constants/routes.client'
import type { PageProps } from '~/types/common'
import { getPageTitle } from '~/utils/common'
import { getAllDocPaths } from '~/utils/docs'
import { getDocNavigation, getDocTitle } from '~/utils/docs.client'
import { getDocsUrl } from '~/utils/link'

type MDXContent = React.ComponentType

export async function generateMetadata(
  { params }: PageProps<{ docTitle: string[] }>,
): Promise<Metadata> {
  const { docTitle } = await params

  if (docTitle.length === 0) {
    return {
      title: getPageTitle('文档'),
      description: 'NestJS 中文文档 - 完整的 NestJS 框架学习指南',
    }
  }

  const docPath = docTitle.join('/')

  // 优先从导航数据中获取中文标题，如果找不到则使用默认逻辑
  const pageTitle = getDocTitle(docPath, docTitle)

  // 根据文档路径生成更具体的描述
  const getDescription = (path: string): string => {
    if (path.includes('fundamentals')) {
      return `NestJS 基础概念 - ${pageTitle} | 深入理解 NestJS 核心原理和最佳实践`
    }

    if (path.includes('techniques')) {
      return `NestJS 高级技术 - ${pageTitle} | 掌握 NestJS 高级开发技巧和模式`
    }

    if (path.includes('security')) {
      return `NestJS 安全 - ${pageTitle} | NestJS 应用安全最佳实践指南`
    }

    if (path.includes('graphql')) {
      return `NestJS GraphQL - ${pageTitle} | 使用 NestJS 构建 GraphQL API`
    }

    if (path.includes('microservices')) {
      return `NestJS 微服务 - ${pageTitle} | NestJS 微服务架构开发指南`
    }

    if (path.includes('websockets')) {
      return `NestJS WebSocket - ${pageTitle} | 实时通信解决方案`
    }

    if (path.includes('cli')) {
      return `NestJS CLI - ${pageTitle} | NestJS 命令行工具使用指南`
    }

    if (path.includes('recipes')) {
      return `NestJS 实践 - ${pageTitle} | 实用的 NestJS 开发技巧和示例`
    }

    return `NestJS 中文文档 - ${pageTitle} | 详细的 NestJS 开发指南和最佳实践`
  }

  // 生成关键词
  const generateKeywords = (path: string): string[] => {
    const baseKeywords = ['NestJS', 'Node.js', 'TypeScript', '后端框架', '中文文档']

    if (path.includes('fundamentals')) {
      return [...baseKeywords, '基础概念', '依赖注入', '模块系统']
    }

    if (path.includes('techniques')) {
      return [...baseKeywords, '高级技术', '缓存', '配置', '数据库']
    }

    if (path.includes('security')) {
      return [...baseKeywords, '安全', '认证', '授权', 'CORS', 'CSRF']
    }

    if (path.includes('graphql')) {
      return [...baseKeywords, 'GraphQL', 'API', '查询语言']
    }

    if (path.includes('microservices')) {
      return [...baseKeywords, '微服务', '分布式', '消息队列']
    }

    if (path.includes('websockets')) {
      return [...baseKeywords, 'WebSocket', '实时通信', '双向通信']
    }

    if (path.includes('cli')) {
      return [...baseKeywords, 'CLI', '命令行', '脚手架', '代码生成']
    }

    if (path.includes('recipes')) {
      return [...baseKeywords, '实践', '示例', '最佳实践', '开发技巧']
    }

    return baseKeywords
  }

  return {
    title: getPageTitle(pageTitle),
    description: getDescription(docPath),
    keywords: generateKeywords(docPath),
    openGraph: {
      title: getPageTitle(pageTitle),
      description: getDescription(docPath),
      type: 'article',
      locale: SITE_CONFIG.language,
      siteName: SITE_CONFIG.name,
      url: getDocsUrl(docPath),
    },
    twitter: {
      card: 'summary_large_image',
      title: getPageTitle(pageTitle),
      description: getDescription(docPath),
    },
    alternates: {
      canonical: getDocsUrl(docPath),
      languages: {
        'zh-CN': getDocsUrl(docPath),
        en: `${SITE_CONFIG.englishDocsUrl}/${docPath}`,
      },
    },
  }
}

// 生成静态参数，预构建所有文档页面
export async function generateStaticParams() {
  try {
    const paths = await getAllDocPaths()

    return paths.map((path) => ({
      docTitle: path.split('/'),
    }))
  }
  catch (error) {
    consola.error('生成静态参数失败:', error)

    return []
  }
}

async function DocContent({ docPath }: { docPath: string }) {
  try {
    // 动态导入 MDX 内容
    const { default: DocComponent } = await import(`~/content/docs/${docPath}.mdx`) as { default: MDXContent }

    return <DocComponent />
  }
  catch (err) {
    consola.error(`无法加载文档: ${docPath}`, err)
    notFound()
  }
}

export default async function DocsPage({ params }: PageProps<{ docTitle: string[] }>) {
  const { docTitle } = await params

  if (docTitle.length === 0) {
    notFound()
  }

  const docPath = docTitle.join('/')

  // 优先从导航数据中获取中文标题，如果找不到则使用默认逻辑
  const pageTitle = getDocTitle(docPath, docTitle)

  // 获取导航信息
  const navigation = getDocNavigation(`/${docPath}`)

  // 生成面包屑导航
  const breadcrumbs = [
    { name: '首页', url: RoutePath.Home },
    { name: '文档', url: RoutePath.Docs },
    ...docTitle.map((segment, index) => {
      const currentPath = docTitle.slice(0, index + 1).join('/')
      const segmentTitle = getDocTitle(currentPath, [segment])

      return {
        name: segmentTitle,
        url: getDocsUrl(currentPath),
      }
    }),
  ]

  const getDescription = (path: string): string => {
    if (path.includes('fundamentals')) {
      return `NestJS 基础概念 - ${pageTitle} | 深入理解 NestJS 核心原理和最佳实践`
    }

    if (path.includes('techniques')) {
      return `NestJS 高级技术 - ${pageTitle} | 掌握 NestJS 高级开发技巧和模式`
    }

    if (path.includes('security')) {
      return `NestJS 安全 - ${pageTitle} | NestJS 应用安全最佳实践指南`
    }

    if (path.includes('graphql')) {
      return `NestJS GraphQL - ${pageTitle} | 使用 NestJS 构建 GraphQL API`
    }

    if (path.includes('microservices')) {
      return `NestJS 微服务 - ${pageTitle} | NestJS 微服务架构开发指南`
    }

    if (path.includes('websockets')) {
      return `NestJS WebSocket - ${pageTitle} | 实时通信解决方案`
    }

    if (path.includes('cli')) {
      return `NestJS CLI - ${pageTitle} | NestJS 命令行工具使用指南`
    }

    if (path.includes('recipes')) {
      return `NestJS 实践 - ${pageTitle} | 实用的 NestJS 开发技巧和示例`
    }

    return `NestJS 中文文档 - ${pageTitle} | 详细的 NestJS 开发指南和最佳实践`
  }

  return (
    <>
      <StructuredData
        breadcrumbs={breadcrumbs}
        description={getDescription(docPath)}
        title={getPageTitle(pageTitle)}
        type="documentation"
        url={getDocsUrl(docPath)}
      />

      <div className="max-w-[80ch] mx-auto py-[var(--content-padding)]">
        <ProseContainer as="article">
          <Suspense fallback={<DocLoadingSkeleton />}>
            <DocContent docPath={docPath} />
          </Suspense>
        </ProseContainer>

        <DocNavigation
          next={navigation.next}
          prev={navigation.prev}
        />
      </div>
    </>
  )
}
