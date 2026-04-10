'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLinkIcon, LanguagesIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { RoutePath } from '~/constants/routes.client'

/**
 * 将中文文档路径转换为英文文档路径
 * @param chinesePath 中文文档路径，如 '/docs/introduction'
 * @returns 英文文档路径，如 '/docs-en/introduction'
 */
export function getEnglishDocPath(chinesePath: string): string {
  const docPath = chinesePath.replace(RoutePath.Docs, '')

  const url = new URL(docPath, 'https://docs.nestjs.com')

  return url.toString()
}

export function EnglishDocLink() {
  const pathname = usePathname()

  const englishDocPath = getEnglishDocPath(pathname)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={englishDocPath} rel="noopener noreferrer" target="_blank">
          <Button
            className="inline-flex items-center gap-2 h-6 transition-all justify-start text-xs text-muted-foreground hover:text-foreground"
            size="sm"
            variant="ghost"
          >
            <LanguagesIcon className="size-3.5" />
            英文原版
            <ExternalLinkIcon className="size-3" />
          </Button>
        </Link>
      </TooltipTrigger>

      <TooltipContent>
        查看英文原版文档
      </TooltipContent>
    </Tooltip>
  )
}
