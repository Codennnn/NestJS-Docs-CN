import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { getDocLinkHref } from '~/utils/link'

interface NavigationLinkProps {
  title: string
  url: string
  direction: 'prev' | 'next'
}

function NavigationLink(props: NavigationLinkProps) {
  const { title, url, direction } = props

  const isPrev = direction === 'prev'

  return (
    <Link
      className={cn(
        'group inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-sm max-w-full',
        'hover:bg-muted/50 transition-colors',
      )}
      href={getDocLinkHref(url)}
    >
      <div className="flex items-center gap-1.5 w-full text-muted-foreground group-hover:text-foreground transition-colors">
        {isPrev && <ArrowLeftIcon className="size-3.5 shrink-0" strokeWidth={2.8} />}

        <div className="font-medium truncate">
          {title}
        </div>

        {!isPrev && <ArrowRightIcon className="size-3.5 shrink-0" strokeWidth={2.8} />}
      </div>
    </Link>
  )
}

interface DocNavigationProps {
  prev: { title: string, url: string } | null
  next: { title: string, url: string } | null
  className?: string
}

export function DocNavigation({ prev, next, className }: DocNavigationProps) {
  if (!prev && !next) {
    return null
  }

  return (
    <nav className={cn('flex items-center gap-4 pt-8 mt-8 border-t border-border', className)}>
      <div className="basis-1/2 grow-0 min-w-0">
        {prev && (
          <NavigationLink
            direction="prev"
            title={prev.title}
            url={prev.url}
          />
        )}
      </div>

      <div className="basis-1/2 grow-0 min-w-0 flex justify-end">
        {next && (
          <NavigationLink
            direction="next"
            title={next.title}
            url={next.url}
          />
        )}
      </div>
    </nav>
  )
}
