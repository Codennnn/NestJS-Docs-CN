import { AnswerPanelSide } from '~/components/answer/AnswerPanelSide'
import { EnglishDocLink } from '~/components/doc/EnglishDocLink'
import { ScrollToTop } from '~/components/doc/ScrollToTop'
import { TableOfContents } from '~/components/doc/TableOfContents'
import { AppHeader } from '~/components/layout/AppHeader'
import { AppSidebar } from '~/components/layout/AppSidebar'
import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'
import { SCROLL_CONFIG } from '~/lib/scroll-config'
import { cn } from '~/lib/utils'

import { DocsLayoutClient } from './layout.client'

export default function DocsLayout(props: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="@container/docs-content">
        <div
          className={cn(
            'size-full flex flex-col',
            '@6xl/docs-content:[--content-padding:4rem]',
            '@4xl/docs-content:[--content-padding:3rem]',
            '@lg/docs-content:[--content-padding:1.5rem]',
            '[--content-padding:1rem]',
          )}
        >
          <AppHeader />

          <div className="flex-1 flex overflow-hidden">
            <ScrollGradientContainer
              className="flex-1 overflow-y-auto @container/docs-content"
              id={SCROLL_CONFIG.CONTAINER_ID}
            >
              {/* 使用客户端组件来处理 hash 导航 */}
              <DocsLayoutClient containerId={SCROLL_CONFIG.CONTAINER_ID}>
                <div
                  className="flex relative w-full"
                >
                  <div className="flex-1 min-w-0 max-w-full px-[var(--content-padding)]">
                    {props.children}
                  </div>

                  <aside
                    className={cn(
                      'sticky top-0 h-[calc(100vh-var(--header-height))] z-50',
                      '@2xl/docs-content:[--aside-width:calc(var(--spacing)_*_64)] [--aside-width:calc(var(--spacing)_*_60)]',
                      'w-[var(--aside-width)] @2xl:w-[var(--aside-width)]',
                      'hidden @4xl/docs-content:block',
                    )}
                  >
                    <div className="max-h-full w-full pt-[var(--content-padding)] pr-[calc(var(--content-padding)_/_2)] @6xl:pr-[var(--content-padding)] inline-flex flex-col pb-[calc(var(--content-padding)_/_2)] overflow-hidden">
                      <ScrollGradientContainer enableFlex className="pb-4">
                        <TableOfContents />
                      </ScrollGradientContainer>

                      <hr className="bg-border/70" />

                      <div className="inline-flex flex-col items-start gap-1 pt-4">
                        <EnglishDocLink />

                        <ScrollToTop
                          containerId={SCROLL_CONFIG.CONTAINER_ID}
                          scrollThreshold={SCROLL_CONFIG.SCROLL_THRESHOLD}
                        />
                      </div>
                    </div>
                  </aside>

                </div>
              </DocsLayoutClient>
            </ScrollGradientContainer>

            <AnswerPanelSide />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
