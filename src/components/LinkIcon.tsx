import { useMemo } from 'react'

import { ExternalLinkIcon } from 'lucide-react'

import { GithubIcon } from '~/components/icon/brand-icons'

interface LinkIconProps {
  link: string
}

export function LinkIcon(props: LinkIconProps) {
  const { link } = props

  const url = useMemo(() => {
    try {
      return new URL(link)
    }
    catch {
      return null
    }
  }, [link])

  const hostname = url?.hostname

  if (hostname) {
    if (hostname.includes('github.com')) {
      return <GithubIcon className="size-[1em]" />
    }
  }

  return <ExternalLinkIcon className="size-[0.9em]" />
}
