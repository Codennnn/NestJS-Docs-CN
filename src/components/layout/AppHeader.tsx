'use client'

import { DocBreadcrumbs } from '~/components/doc/DocBreadcrumbs'
import { SidebarToggleButton } from '~/components/layout/SidebarToggleButton'

export function AppHeader() {
  return (
    <div className="flex items-center gap-4 h-[var(--header-height)] px-[var(--content-padding)]">
      <SidebarToggleButton />

      {/* 面包屑导航 */}
      <DocBreadcrumbs className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap" />
    </div>
  )
}
