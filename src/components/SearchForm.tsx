'use client'

import { useState } from 'react'

import { preloadAnswerPanel } from '~/components/answer/AnswerPanelSide'
import { AnswerTrigger } from '~/components/answer/AnswerTrigger'
import { SearchDialog } from '~/components/search/SearchDialog'
import { SearchTrigger } from '~/components/search/SearchTrigger'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'
import { useLazyComponent } from '~/hooks/useLazyComponent'
import { openAnswerPanel } from '~/utils/answer-events'

export function SearchForm() {
  const [searchOpen, setSearchOpen] = useState(false)

  // 使用懒加载 Hook
  const { preload: handlePreloadAnswerPanel } = useLazyComponent(preloadAnswerPanel, {
    preloadDelay: 100, // 100ms 延迟，避免意外触发
  })

  return (
    <div>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <div className="space-y-1.5">
            <SearchTrigger
              onTriggerOpen={() => {
                setSearchOpen(true)
              }}
            />

            <AnswerTrigger
              onMouseEnter={() => {
                handlePreloadAnswerPanel()
              }}
              onTriggerOpen={() => {
                openAnswerPanel()
              }}
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  )
}
