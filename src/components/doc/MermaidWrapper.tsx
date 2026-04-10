'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '~/components/ui/skeleton'

const MermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-64 rounded-lg" />,
  },
)

interface MermaidWrapperProps {
  chart: string
  className?: string
}

export function MermaidWrapper({ chart, className }: MermaidWrapperProps) {
  return <MermaidDiagram chart={chart} className={className} />
}
