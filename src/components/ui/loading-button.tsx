import { type JSX, useId } from 'react'

import { Button, type ButtonProps } from './button'

function LoadingIndicator() {
  const uniqueId = useId().replace(/:/g, '')
  const gradientId = `loading-button-gradient-${uniqueId}`
  const circleId = `loading-button-circle-${uniqueId}`

  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <style>
        {`
          @keyframes spin8932 {
            to {
              transform: rotate(360deg);
            }
          }

          #${circleId} {
            transform-origin: 50% 50%;
            stroke: url(#${gradientId});
            fill: none;
            animation: spin8932 .5s infinite linear;
          }
        `}
      </style>

      <circle cx="10" cy="10" id={circleId} r="8" strokeWidth="2" />
    </svg>
  )
}

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
}

function LoadingButton({
  children,
  isLoading = true,
  ...props
}: LoadingButtonProps): JSX.Element {
  return (
    <Button
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <LoadingIndicator /> : null}
      {children}
    </Button>
  )
}

export { LoadingButton }
