import { useMemo } from 'react'

import {
  AlertTriangleIcon,
  BadgeAlertIcon,
  InfoIcon,
  LightbulbIcon,
} from 'lucide-react'

import { SpacingWrapper } from '~/components/doc/SpacingWrapper'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { cn } from '~/lib/utils'

export interface CalloutInfoProps {
  type?: 'secondary' | 'info' | 'warning' | 'error' | 'success'
  title?: React.ReactNode
  description?: string
}

export function CalloutInfo(props: React.PropsWithChildren<CalloutInfoProps>) {
  const { children, type = 'secondary', title, description } = props

  const borderClass = useMemo(() => {
    switch (type) {
      case 'secondary':
        return 'bg-[var(--color-secondary)] outline-[var(--color-background)] [&_code]:outline [&_code]:outline-background'

      case 'info':
        return 'border-blue-500 bg-blue-500/10 outline-blue-500/30'

      case 'warning':
        return 'border-amber-500 bg-amber-500/10 outline-amber-500/30'

      case 'error':
        return 'border-red-500 bg-red-500/10 outline-red-500/30'

      case 'success':
        return 'border-green-500 bg-green-500/10 outline-green-500/30'
    }
  }, [type])

  const titleTextColor = useMemo(() => {
    switch (type) {
      case 'info':
        return 'text-blue-800 dark:text-blue-500'

      case 'warning':
        return 'text-amber-800 dark:text-amber-500'

      case 'error':
        return 'text-red-800 dark:text-red-500'

      case 'success':
        return 'text-green-800 dark:text-green-500'

      default:
        return 'text-foreground'
    }
  }, [type])

  const contentTextColor = useMemo(() => {
    switch (type) {
      case 'info':
        return 'text-blue-950 dark:text-blue-600'

      case 'warning':
        return 'text-amber-950 dark:text-amber-600'

      case 'error':
        return 'text-red-950 dark:text-red-600'

      case 'success':
        return 'text-green-950 dark:text-green-600'

      default:
        return 'text-foreground'
    }
  }, [type])

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon />

      case 'warning':
        return <BadgeAlertIcon />

      case 'error':
        return <AlertTriangleIcon />

      case 'success':
        return <LightbulbIcon />

      default:
        return <InfoIcon />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'warning':
        return '注意'

      case 'error':
        return '警告'

      case 'success':
        return '建议'

      default:
        return '提示'
    }
  }

  return (
    <SpacingWrapper>
      <Alert
        className={cn(
          'prose-strong:text-inherit prose-strong:font-medium',
          'prose-a:text-inherit',
          'prose-p:first:mt-0 prose-p:last:mb-0',
          'outline -outline-offset-4',
          borderClass,
          titleTextColor,
        )}
        data-component="callout-info"
      >
        {getIcon()}

        <AlertTitle>{title ?? getDefaultTitle()}</AlertTitle>

        <AlertDescription>
          <div className={contentTextColor}>
            {children ?? description}
          </div>
        </AlertDescription>
      </Alert>
    </SpacingWrapper>
  )
}
