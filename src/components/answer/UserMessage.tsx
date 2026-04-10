'use client'

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="bg-muted rounded-md px-2 py-1.5 inline-block text-sm max-w-[clamp(100px,80%,400px)]">
        <div className="whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  )
}
