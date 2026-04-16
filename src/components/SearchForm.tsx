'use client'

import { useState } from 'react'

import { SearchDialog } from '~/components/search/SearchDialog'
import { SearchTrigger } from '~/components/search/SearchTrigger'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'

export function SearchForm() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SearchTrigger
            onTriggerOpen={() => {
              setSearchOpen(true)
            }}
          />
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  )
}
