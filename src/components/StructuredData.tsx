import Script from 'next/script'

import { SITE_CONFIG } from '~/constants/common'
import { getDocsUrl, getFullUrl } from '~/utils/link'

interface StructuredDataProps {
  type: 'website' | 'article' | 'documentation'
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  author?: string
  breadcrumbs?: {
    name: string
    url: string
  }[]
}

/**
 * StructuredData 组件
 *
 * 作用：为 NestJS 中文文档网站提供结构化数据（JSON-LD）支持，用于 SEO 优化
 *
 * 主要功能：
 * 1. 生成符合 Schema.org 标准的结构化数据，帮助搜索引擎更好地理解页面内容
 * 2. 支持多种页面类型：网站首页（website）、文章（article）、技术文档（documentation）
 * 3. 为搜索引擎提供丰富的元信息，包括标题、描述、作者、发布时间等
 * 4. 生成面包屑导航的结构化数据，提升搜索结果的展示效果
 * 5. 针对技术文档特别优化，包含软件应用信息、教育级别、目标受众等
 *
 * SEO 优势：
 * - 提高搜索引擎对页面内容的理解度
 * - 增加在搜索结果中获得富媒体展示的机会
 * - 改善页面在搜索引擎中的排名和点击率
 * - 支持搜索功能的结构化数据，便于用户直接在搜索引擎中进行站内搜索
 */
export function StructuredData({
  type,
  title,
  description,
  url,
  datePublished,
  dateModified,
  author = SITE_CONFIG.author,
  breadcrumbs = [],
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : 'TechArticle',
      name: title,
      headline: title,
      description,
      url,
      inLanguage: SITE_CONFIG.locale,
      author: {
        '@type': 'Organization',
        name: author,
        url: SITE_CONFIG.baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.publisher,
        url: SITE_CONFIG.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: getFullUrl(SITE_CONFIG.logoPath),
        },
      },
    }

    if (type === 'website') {
      return {
        ...baseData,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${getDocsUrl()}?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
    }

    // For article and documentation types
    const articleData: Record<string, unknown> = {
      ...baseData,
      '@type': 'TechArticle',
      about: {
        '@type': 'SoftwareApplication',
        name: 'NestJS',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        programmingLanguage: 'TypeScript',
      },
      teaches: 'NestJS 框架开发',
      educationalLevel: 'intermediate',
      audience: {
        '@type': 'Audience',
        audienceType: 'Developers',
      },
    }

    if (datePublished) {
      articleData.datePublished = datePublished
    }

    if (dateModified) {
      articleData.dateModified = dateModified
    }

    return articleData
  }

  const breadcrumbData = breadcrumbs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      }
    : null

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData()),
        }}
        id="structured-data"
        type="application/ld+json"
      />
      {breadcrumbData && (
        <Script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
          id="breadcrumb-data"
          type="application/ld+json"
        />
      )}
    </>
  )
}
