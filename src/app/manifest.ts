import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '~/constants/common'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e11d48',
    orientation: 'portrait-primary',
    icons: [
      {
        src: SITE_CONFIG.logoPath,
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/logos/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logos/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['education', 'developer', 'documentation'],
    lang: SITE_CONFIG.locale,
    scope: '/',
    id: 'nestjs-docs-cn',
  }
}
