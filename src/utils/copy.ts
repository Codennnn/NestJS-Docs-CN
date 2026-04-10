import { toast } from 'sonner'

/**
 * 检查是否支持复制功能
 */
export function isClipboardSupported(): boolean {
  return (
    typeof navigator !== 'undefined'
    && typeof navigator.clipboard !== 'undefined'
    && typeof navigator.clipboard.writeText === 'function'
  )
}

/**
 * 复制选项配置
 */
export interface CopyOptions {
  /** 是否显示成功提示 */
  showToast?: boolean
  /** 自定义成功提示信息 */
  successMessage?: string
  /** 自定义错误提示信息 */
  errorMessage?: string
  /** 复制成功后的回调函数 */
  onSuccess?: () => void
  /** 复制失败后的回调函数 */
  onError?: (error: Error) => void
}

/**
 * 复制结果
 */
export interface CopyResult {
  /** 是否复制成功 */
  success: boolean
  /** 错误信息（如果失败） */
  error?: Error
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param options 复制选项
 * @returns 复制结果
 */
export async function copyToClipboard(
  text: string,
  options: CopyOptions = {},
): Promise<CopyResult> {
  const {
    showToast = false,
    successMessage = '已复制到剪贴板',
    errorMessage = '复制失败',
    onSuccess,
    onError,
  } = options

  try {
    if (!isClipboardSupported()) {
      throw new Error('浏览器不支持 Clipboard API')
    }

    await navigator.clipboard.writeText(text)

    // 显示成功提示
    if (showToast) {
      toast.success(successMessage)
    }

    // 执行成功回调
    onSuccess?.()

    return { success: true }
  }
  catch (error) {
    const err = error instanceof Error ? error : new Error('复制失败')

    // 显示错误提示
    if (showToast) {
      toast.error(errorMessage)
    }

    // 执行错误回调
    onError?.(err)

    return { success: false, error: err }
  }
}
