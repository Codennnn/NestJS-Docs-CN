'use client'

import { useEffect, useRef } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CollapsibleNavItem } from '~/components/CollapsibleNavItem'
import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { SearchForm } from '~/components/SearchForm'
import { ThemeModeToggle } from '~/components/ThemeModeToggle'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { SITE_CONFIG } from '~/constants/common'
import { RoutePath } from '~/constants/routes.client'
import { navMainData } from '~/lib/data/nav'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  /**
   * 滚动到激活的菜单项
   * 确保当前激活的导航项在用户视野内
   */
  const scrollToActiveItem = () => {
    if (!scrollContainerRef.current) {
      return
    }

    // 查找当前激活的菜单项元素
    const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]')

    if (activeElement) {
      // 使用 scrollIntoView 将激活的菜单项滚动到视野中央
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }

  // 当路径变化时，延迟执行滚动以确保 DOM 更新完成
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveItem()
    }, 100) // 给一些时间让菜单展开和 DOM 更新

    return () => {
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={RoutePath.Home}>
              <SidebarMenuButton asChild size="lg">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center">
                    <Image
                      alt="NestJS Logo"
                      height={32}
                      src={SITE_CONFIG.logoPath}
                      width={32}
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="font-semibold">NestJS 中文文档</div>
                    <div className="text-xs text-muted-foreground font-medium">v10.0.0</div>
                  </div>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchForm />
      </SidebarHeader>

      <ScrollGradientContainer
        ref={scrollContainerRef}
        gradientFromColor="from-sidebar"
        gradientHeight="h-12"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navMainData
                .filter((item) => !item.hiddenInSidebar)
                .map((item, idx) => (
                  <CollapsibleNavItem
                    key={`${item.title ?? ''}-${idx}`}
                    defaultOpen={item.defaultOpen}
                    item={item}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </ScrollGradientContainer>

      <div className="flex items-center gap-2 p-4 border-t border-border">
        <ThemeModeToggle />
      </div>
    </Sidebar>
  )
}
