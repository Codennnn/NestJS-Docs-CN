import Image from 'next/image'

import logo from '/public/logos/logo-128.png'

/**
 * Open Graph 静态页面
 * 专门用于生成 Open Graph 图片的静态布局页面
 */
export default function OpenGraphPage() {
  return (
    <div
      className="relative w-[1200px] h-[630px] overflow-hidden bg-background text-foreground-accent"
      style={{
        transform: 'scale(1)',
      }}
    >

      {/* 主要内容区域 */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-16">
        <div className="max-w-4xl">
          {/* Logo 区域 */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-background/80 backdrop-blur rounded-3xl p-6 shadow-2xl border border-border">
              <Image
                alt="NestJS Logo"
                className="rounded-2xl"
                height={96}
                src={logo}
                width={96}
              />
            </div>
          </div>

          {/* 文字内容 */}
          <div className="space-y-8">
            <h1 className="text-8xl font-bold leading-tight">
              NestJS 中文文档
            </h1>
            <h2 className="text-5xl font-bold">
              专业翻译 · 深度优化 · 持续更新
            </h2>
            <p className="text-4xl leading-relaxed opacity-70 font-medium">
              让中文开发者轻松掌握 NestJS 框架的最佳学习资源
            </p>
          </div>
        </div>
      </div>

      {/* 背景渐变 - 与首页保持一致 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, oklch(from var(--theme) l c h / 8%) 0%, oklch(from var(--theme2) l c h / 7%) 70%)',
        }}
      >
        {/* 噪点纹理背景 */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url("/assets/elements/noise.webp")',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px',
          }}
        />
      </div>
    </div>
  )
}
