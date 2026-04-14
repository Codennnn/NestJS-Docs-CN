'use client'

import { usePathname } from 'next/navigation'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { SidebarMenuButton, SidebarMenuSubButton } from '~/components/ui/sidebar'
import { RoutePath } from '~/constants/routes.client'

interface SidebarMenuItemType {
  title?: string
  url?: string
  items?: {
    title?: string
    url?: string
    isActive?: boolean
  }[]
}

interface AppSidebarMenuButtonProps extends React.ComponentProps<typeof SidebarMenuButton> {
  item: SidebarMenuItemType
}

interface AppSidebarMenuSubButtonProps extends React.ComponentProps<typeof SidebarMenuSubButton> {
  item: SidebarMenuItemType
}

export function AppSidebarMenuButton(
  { children, item, ...restProps }: React.PropsWithChildren<AppSidebarMenuButtonProps>,
) {
  const pathname = usePathname()
  const isActive = pathname === `${RoutePath.Docs}${item.url}`

  return (
    <SidebarMenuButton
      {...restProps}
      isActive={isActive}
    >
      {children}
    </SidebarMenuButton>
  )
}

export function AppSidebarMenuSubButton(
  { children, item, ...restProps }: React.PropsWithChildren<AppSidebarMenuSubButtonProps>,
) {
  const pathname = usePathname()
  const isActive = pathname === `${RoutePath.Docs}${item.url}`

  return (
    <SidebarMenuSubButton
      isActive={isActive}
      {...restProps}
    >
      {children}
    </SidebarMenuSubButton>
  )
}

export function SidebarMenuButtonContent(
  { item, isOpen }: { item: SidebarMenuItemType, isOpen?: boolean },
) {
  return (
    <>
      <span className="flex-1 truncate min-w-0">
        {item.title}
      </span>

      {item.items && item.items.length > 0
        ? (
            <span className="ml-auto shrink-0">
              {isOpen
                ? (
                    <ChevronDownIcon className="collapsible-group-open" size={14} />
                  )
                : (
                    <ChevronRightIcon className="collapsible-group-closed" size={14} />
                  )}
            </span>
          )
        : null}
    </>
  )
}
