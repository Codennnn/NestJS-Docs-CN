import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 规范化路径，确保路径以 / 开头
 * @param path - 需要规范化的路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}
