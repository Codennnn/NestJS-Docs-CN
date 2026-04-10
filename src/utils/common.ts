import { SITE_CONFIG } from '~/constants/common'

export function getPageTitle(title?: string): string {
  const mainTitle = SITE_CONFIG.title

  return title ? `${title} | ${mainTitle}` : mainTitle
}
