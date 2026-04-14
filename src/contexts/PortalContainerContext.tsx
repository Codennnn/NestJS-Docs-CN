import { createContext, useContext } from 'react'

/**
 * Portal Container Context
 * 用于在 Shadow DOM 环境下提供正确的 Portal 挂载容器
 *
 * 在普通环境下（Options/Popup/Sidepanel），值为 undefined，Portal 会挂载到 document.body
 * 在 Shadow DOM 环境下（Content Script），值为 Shadow Root，Portal 会挂载到 Shadow DOM 内部
 */
interface PortalContainerContextValue {
  container?: HTMLElement | ShadowRoot | null
}

const PortalContainerContext = createContext<PortalContainerContextValue>({
  container: undefined,
})

export function PortalContainerProvider({
  container,
  children,
}: React.PropsWithChildren<PortalContainerContextValue>) {
  return (
    <PortalContainerContext.Provider value={{ container }}>
      {children}
    </PortalContainerContext.Provider>
  )
}

export function usePortalContainer(): HTMLElement | ShadowRoot | null | undefined {
  const context = useContext(PortalContainerContext)

  return context.container
}
