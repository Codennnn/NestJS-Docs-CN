'use client'

import { useState } from 'react'

import { CalloutInfo, type CalloutInfoProps } from '~/components/doc/CalloutInfo'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

type CalloutType = 'secondary' | 'info' | 'warning' | 'error' | 'success'

interface CalloutConfig {
  type: CalloutType
  title: string
  description: string
  children: string
  useCustomTitle: boolean
  useDescription: boolean
  useChildren: boolean
}

const defaultConfigs: Record<CalloutType, CalloutConfig> = {
  secondary: {
    type: 'secondary',
    title: '提示',
    description: '这是一个默认的提示信息。',
    children: '这是通过 children 传递的内容，支持 **Markdown** 语法和 `代码` 高亮。',
    useCustomTitle: false,
    useDescription: false,
    useChildren: true,
  },
  info: {
    type: 'info',
    title: '信息',
    description: '这是一个信息提示，用于展示重要的信息内容。',
    children: '**重要信息**：这里包含了一些需要用户了解的关键信息。可以包含 `代码片段` 和其他格式化内容。',
    useCustomTitle: false,
    useDescription: false,
    useChildren: true,
  },
  warning: {
    type: 'warning',
    title: '注意',
    description: '这是一个警告提示，提醒用户注意某些重要事项。',
    children: '⚠️ **注意**：在执行此操作之前，请确保你已经备份了重要数据。使用 `npm backup` 命令进行备份。',
    useCustomTitle: false,
    useDescription: false,
    useChildren: true,
  },
  error: {
    type: 'error',
    title: '警告',
    description: '这是一个错误提示，用于显示错误信息或危险操作警告。',
    children: '🚨 **危险操作**：此操作不可逆转！执行 `rm -rf /` 命令将会删除所有文件。请谨慎操作。',
    useCustomTitle: false,
    useDescription: false,
    useChildren: true,
  },
  success: {
    type: 'success',
    title: '建议',
    description: '这是一个成功提示，用于显示成功信息或最佳实践建议。',
    children: '✅ **最佳实践**：建议使用 `TypeScript` 来提高代码质量，并配置 `ESLint` 进行代码检查。',
    useCustomTitle: false,
    useDescription: false,
    useChildren: true,
  },
}

export default function CalloutInfoTestPage() {
  const [currentType, setCurrentType] = useState<CalloutType>('secondary')
  const [config, setConfig] = useState<CalloutConfig>(defaultConfigs.secondary)

  const handleTypeChange = (type: CalloutType) => {
    setCurrentType(type)
    setConfig(defaultConfigs[type])
  }

  const handleConfigChange = (key: keyof CalloutConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const resetToDefault = () => {
    setConfig(defaultConfigs[currentType])
  }

  const renderCallout = () => {
    const props: CalloutInfoProps = {
      type: config.type,
    }

    if (config.useCustomTitle) {
      props.title = config.title
    }

    if (config.useDescription) {
      props.description = config.description

      return <CalloutInfo {...props} />
    }

    if (config.useChildren) {
      return <CalloutInfo {...props}>{config.children}</CalloutInfo>
    }

    return <CalloutInfo {...props} />
  }

  return (
    <div className="px-test-page-x py-test-page-y">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">CalloutInfo 组件测试</h1>
        <p className="text-muted-foreground">
          这个页面用于测试 CalloutInfo 组件的各种样式变体和属性配置。你可以通过调整不同的参数来实时预览组件效果。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 控制面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>组件配置</CardTitle>
              <CardDescription>
                调整下面的参数来自定义 CalloutInfo 组件的外观和行为
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 类型选择 */}
              <div className="space-y-3">
                <Label className="text-base font-medium">组件类型</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(['secondary', 'info', 'warning', 'error', 'success'] as CalloutType[]).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        checked={currentType === type}
                        className="rounded"
                        id={type}
                        name="callout-type"
                        type="radio"
                        value={type}
                        onChange={() => { handleTypeChange(type) }}
                      />
                      <Label className="capitalize" htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 内容配置 */}
              <div className="space-y-4">
                <Label className="text-base font-medium">内容配置</Label>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      checked={config.useCustomTitle}
                      className="rounded"
                      id="useCustomTitle"
                      type="checkbox"
                      onChange={(e) => { handleConfigChange('useCustomTitle', e.target.checked) }}
                    />
                    <Label htmlFor="useCustomTitle">使用自定义标题</Label>
                  </div>

                  {config.useCustomTitle && (
                    <div className="space-y-2">
                      <Label htmlFor="title">标题内容</Label>
                      <Input
                        id="title"
                        placeholder="输入自定义标题"
                        value={config.title}
                        onChange={(e) => { handleConfigChange('title', e.target.value) }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      checked={config.useDescription}
                      className="rounded"
                      id="useDescription"
                      type="checkbox"
                      onChange={(e) => { handleConfigChange('useDescription', e.target.checked) }}
                    />
                    <Label htmlFor="useDescription">使用 description 属性</Label>
                  </div>

                  {config.useDescription && (
                    <div className="space-y-2">
                      <Label htmlFor="description">Description 内容</Label>
                      <Textarea
                        id="description"
                        placeholder="输入 description 内容"
                        rows={3}
                        value={config.description}
                        onChange={(e) => { handleConfigChange('description', e.target.value) }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      checked={config.useChildren}
                      className="rounded"
                      id="useChildren"
                      type="checkbox"
                      onChange={(e) => { handleConfigChange('useChildren', e.target.checked) }}
                    />
                    <Label htmlFor="useChildren">使用 children 内容</Label>
                  </div>

                  {config.useChildren && (
                    <div className="space-y-2">
                      <Label htmlFor="children">Children 内容（支持 Markdown）</Label>
                      <Textarea
                        id="children"
                        placeholder="输入 children 内容，支持 Markdown 语法"
                        rows={4}
                        value={config.children}
                        onChange={(e) => { handleConfigChange('children', e.target.value) }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full" variant="outline" onClick={resetToDefault}>
                  重置为默认配置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 代码预览 */}
          <Card>
            <CardHeader>
              <CardTitle>生成的代码</CardTitle>
              <CardDescription>
                当前配置对应的 JSX 代码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>
                  {'<CalloutInfo'}
                  {`\n  type="${config.type}"`}
                  {config.useCustomTitle && `\n  title="${config.title}"`}
                  {config.useDescription && `\n  description="${config.description}"`}
                  {!config.useChildren && '\n/>'}
                  {config.useChildren && '>'}
                  {config.useChildren && `\n  ${config.children}`}
                  {config.useChildren && '\n</CalloutInfo>'}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* 预览区域 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>实时预览</CardTitle>
              <CardDescription>
                当前配置的 CalloutInfo 组件效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-background">
                {renderCallout()}
              </div>
            </CardContent>
          </Card>

          {/* 所有类型的示例 */}
          <Card>
            <CardHeader>
              <CardTitle>所有类型示例</CardTitle>
              <CardDescription>
                展示所有可用的 CalloutInfo 类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CalloutInfo type="secondary">
                这是 **secondary** 类型的提示框，用于一般性的提示信息。
              </CalloutInfo>

              <CalloutInfo type="info">
                这是 **info** 类型的提示框，用于展示重要的信息内容。
              </CalloutInfo>

              <CalloutInfo type="warning">
                这是 **warning** 类型的提示框，用于警告用户注意某些事项。
              </CalloutInfo>

              <CalloutInfo type="error">
                这是 **error** 类型的提示框，用于显示错误信息或危险操作警告。
              </CalloutInfo>

              <CalloutInfo type="success">
                这是 **success** 类型的提示框，用于显示成功信息或最佳实践建议。
              </CalloutInfo>
            </CardContent>
          </Card>

          {/* 高级用法示例 */}
          <Card>
            <CardHeader>
              <CardTitle>高级用法示例</CardTitle>
              <CardDescription>
                展示组件的各种高级用法
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CalloutInfo title="自定义标题" type="info">
                使用自定义标题的示例，内容支持 `代码高亮` 和 **粗体文本**。
              </CalloutInfo>

              <CalloutInfo
                title="复杂内容示例"
                type="warning"
              >
                这个示例展示了复杂的内容格式：

                - 支持列表项
                - 支持 `内联代码`
                - 支持 **粗体** 和 *斜体*

                还可以包含代码块等复杂内容。
              </CalloutInfo>

              <CalloutInfo
                description="这是通过 description 属性传递的纯文本内容，不支持 Markdown 格式。"
                type="success"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// metadata 不能在 'use client' 组件中导出
// 如果需要设置页面元数据，请在父级 Server Component 中设置
