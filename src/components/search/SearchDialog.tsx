'use client'

import { useCallback } from 'react'

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
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="max-w-3xl h-[clamp(200px,50vh,650px)] p-0 gap-0 overflow-hidden outline-background/60 outline-4"
        showCloseButton={false}
      >
        <SearchDialogContent onClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
}
