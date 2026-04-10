import { FolderOpenIcon } from 'lucide-react'

import { LanguageIcon } from '~/components/LanguageIcon'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

export interface FileTreeItem {
  name: string
  icon?: React.ReactNode
  type?: 'folder' | 'file'
  children?: FileTreeItem[]
  comment?: string // 添加注释字段
}

export type FileTreeData = FileTreeItem[]

export interface FileTreeProps {
  data?: FileTreeData
  className?: string
}

// 递归渲染文件树项目
const FileTreeItemComponent = ({ item }: { item: FileTreeItem }) => {
  // 文件夹
  if (item.type === 'folder' || item.children) {
    return (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton className="flex items-center justify-between w-full hover:bg-muted">
          <div className="flex items-center gap-2">
            {item.icon ?? <FolderOpenIcon className="size-4" />}
            {item.name}
          </div>
          {item.comment && (
            <span className="text-muted-foreground text-xs font-normal ml-2">
              {item.comment}
            </span>
          )}
        </SidebarMenuButton>

        {!!item.children && item.children.length > 0 && (
          <SidebarMenuSub>
            {item.children.map((child) => (
              <FileTreeItemComponent key={child.name} item={child} />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  // 文件
  return (
    <SidebarMenuSubItem key={item.name}>
      <SidebarMenuSubButton className="flex items-center justify-between w-full hover:bg-muted">
        <div className="flex items-center gap-2">
          {item.icon ?? (
            <span className="size-4 inline-block">
              <LanguageIcon filename={item.name} lang="ts" />
            </span>
          )}
          {item.name}
        </div>
        {item.comment && (
          <span className="text-muted-foreground text-xs font-normal ml-2">
            {item.comment}
          </span>
        )}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

export function FileTree(props: FileTreeProps) {
  const { data, className } = props

  if (!data?.length) {
    return null
  }

  return (
    <div className="border border-border rounded-lg p-3 font-mono shadow-muted shadow-md">
      <SidebarMenu className={cn('not-prose font-medium list-none', className)}>
        {data.map((item) => (
          <FileTreeItemComponent key={item.name} item={item} />
        ))}
      </SidebarMenu>
    </div>
  )
}
