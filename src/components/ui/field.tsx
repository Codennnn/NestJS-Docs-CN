'use client'

import { Field as FieldPrimitive } from '@base-ui/react/field'

import { cn } from '~/lib/utils'

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      className={cn('flex flex-col items-start gap-2', className)}
      data-slot="field"
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      className={cn(
        'inline-flex items-center gap-2 font-medium text-base/4.5 sm:text-sm/4',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={cn('text-muted-foreground text-xs', className)}
      data-slot="field-description"
      {...props}
    />
  )
}

function FieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      className={cn('text-destructive-foreground text-xs', className)}
      data-slot="field-error"
      {...props}
    />
  )
}

interface FieldErrorTextProps {
  className?: string
}

/**
 * 用于显示表单字段错误信息的纯文本组件
 * 与 FieldError 不同，它不依赖 base-ui 的验证状态，直接渲染传入的内容
 */
function FieldErrorText({ className, children }: React.PropsWithChildren<FieldErrorTextProps>) {
  return (
    <p className={cn('text-xs text-destructive-foreground', className)} data-slot="field-error-text">
      {children}
    </p>
  )
}

const FieldControl = FieldPrimitive.Control
const FieldValidity = FieldPrimitive.Validity

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldErrorText,
  FieldLabel,
  FieldValidity,
}
