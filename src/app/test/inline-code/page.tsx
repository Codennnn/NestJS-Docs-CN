import { MDXRenderer } from '~/components/mdx/MDXRenderer'

const testContent = `# Inline Code 高亮测试

这个页面用于测试 inline code 高亮功能。

## 基本语法

使用 \`{:语言}\` 语法来指定 inline code 的语言：

- JavaScript: \`console.log('Hello World'){:js}\`
- TypeScript: \`const message: string = 'Hello'{:ts}\`
- Python: \`print("Hello World"){:python}\`
- Bash: \`npm install{:bash}\`
- JSON: \`{"name": "test"}{:json}\`

## 复杂示例

在文档中，你可以这样引用代码：

使用 \`useState{:ts}\` Hook 来管理组件状态，或者调用 \`fetch('/api/data'){:js}\` 来获取数据。

配置文件中的 \`"scripts": {"dev": "next dev"}{:json}\` 定义了开发命令。

## 与普通 inline code 的对比

- 普通 inline code: \`console.log('test')\`
- 高亮 inline code: \`console.log('test'){:js}\`

## 在列表中使用

1. 安装依赖: \`npm install @shikijs/rehype{:bash}\`
2. 配置插件: \`rehypeShiki{:js}\`
3. 使用语法: \`code{:lang}\`

## 在表格中使用

| 语言 | 示例代码 | 说明 |
|------|----------|------|
| JavaScript | \`const a = 1{:js}\` | 变量声明 |
| TypeScript | \`interface User{}{:ts}\` | 接口定义 |
| CSS | \`.class { color: red }{:css}\` | 样式规则 |

这样就可以在文档中使用语法高亮的 inline code 了！`

export default function TestInlineCodePage() {
  return (
    <div className="px-test-page-x py-test-page-y">
      <MDXRenderer content={testContent} />
    </div>
  )
}
