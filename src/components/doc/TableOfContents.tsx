'use client'

import Link from 'next/link'

import { Skeleton } from '~/components/ui/skeleton'
import { useTableOfContents } from '~/hooks/useTableOfContents'
import { cn } from '~/lib/utils'

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents(props: TableOfContentsProps) {
  const { className } = props

  const { tocItems, activeId } = useTableOfContents()

  if (tocItems.length === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <h4 className="font-semibold mb-3 truncate">目录</h4>

      <nav className="space-y-2">
        {tocItems.map((item) => (
          <Link
            key={item.id}
            className={cn(
              'block w-full text-left transition-colors duration-200 hover:text-foreground truncate',
              {
                'text-foreground': activeId === item.id,
                'text-muted-foreground': activeId !== item.id,
                'pl-2 text-[0.9em]': item.level === 2,
                'pl-4 text-[0.85em]': item.level === 3,
              },
            )}
            href={`#${item.id}`}
          >
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  )
}
