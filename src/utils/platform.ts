/**
 * 检测用户的操作系统是否为 macOS
 * @returns 如果是 macOS 返回 true，否则返回 false
 */
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent.toLowerCase()

  return (
    userAgent.includes('mac')
    || /iphone|ipad|ipod/.test(userAgent)
  )
}

/**
 * 获取操作系统类型
 * @returns 操作系统类型：'mac' | 'windows' | 'linux' | 'unknown'
 */
export function getOSType(): 'mac' | 'windows' | 'linux' | 'unknown' {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('mac') || /iphone|ipad|ipod/.test(userAgent)) {
    return 'mac'
  }

  if (userAgent.includes('win')) {
    return 'windows'
  }

  if (userAgent.includes('linux')) {
    return 'linux'
  }

  return 'unknown'
}

/**
 * 获取当前应用的运行环境
 */
export function getEnvironment(): 'development' | 'test' | 'production' | 'unknown' {
  // 在服务端和客户端都可以使用 NODE_ENV
  if (typeof process !== 'undefined' && typeof process.env === 'object' && typeof process.env.NODE_ENV === 'string') {
    return process.env.NODE_ENV
  }

  // 如果无法获取到 process.env，则返回 unknown
  return 'unknown'
}

/**
 * 检查当前是否为开发环境
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development'
}

/**
 * 检查当前是否为生产环境
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production'
}

/**
 * 检查当前是否为测试环境
 */
export function isTest(): boolean {
  return getEnvironment() === 'test'
}

/**
 * 获取当前应用是否运行在客户端
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 获取当前应用是否运行在服务端
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}
