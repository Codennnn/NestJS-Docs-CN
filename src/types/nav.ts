export interface NavMenuItem {
  title?: string
  titleEn?: string
  url?: string
  items?: NavMenuItem[]
  /** 控制是否在侧边栏隐藏该导航菜单项，默认为 false（显示） */
  hiddenInSidebar?: boolean
  /** 控制菜单项是否默认展开，默认为 false（收起） */
  defaultOpen?: boolean
}
