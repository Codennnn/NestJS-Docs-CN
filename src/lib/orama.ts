import { OramaCloud } from '@orama/core'

interface OramaClientGlobal {
  __oramaCloudClient__?: OramaCloud
}

const globalOrama = globalThis as typeof globalThis & OramaClientGlobal

function getOramaPublicConfig() {
  const projectId = process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID
  const apiKey = process.env.NEXT_PUBLIC_ORAMA_API_KEY

  if (!projectId || !apiKey) {
    throw new Error(
      '[Orama] 缺少必要的环境变量，请在 .env 文件中配置：\n'
      + '  NEXT_PUBLIC_ORAMA_PROJECT_ID=<your-project-id>\n'
      + '  NEXT_PUBLIC_ORAMA_API_KEY=<your-api-key>',
    )
  }

  return { projectId, apiKey }
}

/**
 * 获取 Orama Cloud 客户端单例
 *
 * 使用单例模式避免重复创建客户端实例，
 * 所有搜索和 AI 会话共享同一个客户端连接。
 */
export function getOramaClient(): OramaCloud {
  if (globalOrama.__oramaCloudClient__) {
    return globalOrama.__oramaCloudClient__
  }

  const { projectId, apiKey } = getOramaPublicConfig()

  globalOrama.__oramaCloudClient__ = new OramaCloud({ projectId, apiKey })

  return globalOrama.__oramaCloudClient__
}
