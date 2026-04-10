/**
 * 滚动相关配置
 */
export const SCROLL_CONFIG = {
  /**
   * 文档滚动容器的 ID
   */
  CONTAINER_ID: 'docs-scroll-container',

  /**
   * 滚动多少像素后显示回到顶部按钮
   */
  SCROLL_THRESHOLD: 300,

  /**
   * 滚动事件节流延迟（毫秒）
   */
  THROTTLE_DELAY: 100,
} as const
