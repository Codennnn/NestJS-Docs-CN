/** 自定义事件类型 */
type AnswerPanelEvent = 'open' | 'close' | 'toggle'

// 事件管理器
class AnswerPanelEventManager {
  private listeners = new Map<AnswerPanelEvent, Set<() => void>>()

  // 添加事件监听器
  addEventListener(event: AnswerPanelEvent, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback)

    // 返回清理函数
    return () => {
      this.removeEventListener(event, callback)
    }
  }

  // 移除事件监听器
  removeEventListener(event: AnswerPanelEvent, callback: () => void) {
    const eventListeners = this.listeners.get(event)

    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  // 触发事件
  dispatchEvent(event: AnswerPanelEvent) {
    const eventListeners = this.listeners.get(event)

    if (eventListeners) {
      eventListeners.forEach((callback) => {
        callback()
      })
    }
  }

  // 清理所有监听器
  clearAllListeners() {
    this.listeners.clear()
  }
}

// 导出单例实例
export const answerPanelEvents = new AnswerPanelEventManager()

export const openAnswerPanel = () => {
  answerPanelEvents.dispatchEvent('open')
}

export const closeAnswerPanel = () => {
  answerPanelEvents.dispatchEvent('close')
}

export const toggleAnswerPanel = () => {
  answerPanelEvents.dispatchEvent('toggle')
}
