'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { PUBLIC_ROUTES } from '~/constants/routes.client'

export default function TestLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const pathname = usePathname()
  const isTestHomePage = pathname === PUBLIC_ROUTES.TEST

  return (
    <div className="container mx-auto p-test-page flex flex-col">
      {!isTestHomePage && (
        <Link href={PUBLIC_ROUTES.TEST}>
          <Button size="sm" variant="ghost">
            <ChevronLeftIcon />
            返回测试页面
          </Button>
        </Link>
      )}

      {children}
    </div>
  )
}
