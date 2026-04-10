'use client'

import { OramaCloud } from '@oramacloud/react-client'

import {
  Dialog,
  DialogContent,
} from '~/components/ui/dialog'

import { SearchDialogContent } from './SearchDialogContent'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="max-w-3xl h-[clamp(200px,50vh,650px)] p-0 gap-0 overflow-hidden outline-background/60 outline-4"
        showCloseButton={false}
      >
        <OramaCloud
          apiKey={process.env.NEXT_PUBLIC_ORAMA_API_KEY!}
          endpoint={process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!}
        >
          <SearchDialogContent onClose={() => { onOpenChange(false) }} />
        </OramaCloud>
      </DialogContent>
    </Dialog>
  )
}
