'use client'

import { forwardRef, useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

export interface PasswordInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /**
   * 是否显示密码可见性切换按钮
   * @default true
   */
  showToggle?: boolean
}

/**
 * 密码输入框组件
 * 支持密码可见性切换功能的输入框
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn('pr-10', className)}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        {showToggle && (
          <Button
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            size="sm"
            type="button"
            variant="ghost"
            onClick={handleTogglePassword}
          >
            {showPassword
              ? (
                  <EyeOff className="h-4 w-4" />
                )
              : (
                  <Eye className="h-4 w-4" />
                )}
            <span className="sr-only">
              {showPassword ? '隐藏密码' : '显示密码'}
            </span>
          </Button>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
