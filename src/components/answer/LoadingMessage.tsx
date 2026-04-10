import { TextShimmer } from '~/components/TextShimmer'

interface LoadingMessageProps {
  isRegenerating?: boolean
}

export function LoadingMessage(props: LoadingMessageProps) {
  const { isRegenerating = false } = props

  return (
    <div className="text-sm">
      <TextShimmer className="whitespace-nowrap text-muted-foreground text-sm font-medium">
        {isRegenerating ? '正在重新生成回答...' : '正在思考...'}
      </TextShimmer>
    </div>
  )
}
