import { type LiteClient, liteClient } from 'algoliasearch/lite'

let algoliaSearchClient: LiteClient | null = null

function getAlgoliaPublicConfig() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY

  if (!appId || !apiKey) {
    throw new Error(
      '[Algolia] 缺少必要的环境变量，请在 .env 文件中配置：\n'
      + '  NEXT_PUBLIC_ALGOLIA_APP_ID=<your-app-id>\n'
      + '  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=<your-search-api-key>',
    )
  }

  return { appId, apiKey }
}

/**
 * 获取 Algolia Search 客户端单例
 *
 * 在客户端组件中复用同一个实例，避免丢失 SDK 内置的请求/响应缓存。
 */
export function getAlgoliaSearchClient(): LiteClient {
  if (algoliaSearchClient) {
    return algoliaSearchClient
  }

  const { appId, apiKey } = getAlgoliaPublicConfig()

  algoliaSearchClient = liteClient(appId, apiKey)

  return algoliaSearchClient
}

/**
 * 获取 Algolia 索引名称
 */
export function getAlgoliaIndexName(): string {
  return process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'nestjs_docs_cn'
}
