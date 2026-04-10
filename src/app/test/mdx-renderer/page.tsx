import { MDXRendererDemo } from '~/components/mdx/MDXRendererDemo'

export default function MDXRendererTestPage() {
  return (
    <main className="min-h-screen bg-background">
      <MDXRendererDemo />
    </main>
  )
}

export const metadata = {
  title: 'DynamicMDXRenderer 测试 - NestJS 中文文档',
  description: '测试动态 MDX 渲染器的流式内容处理和各种 Markdown 语法元素渲染',
}
