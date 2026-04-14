'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import {
  Blocks,
  BookOpen,
  Cpu,
  Database,
  FileCode2,
  Filter,
  Layers,
  LayoutTemplate,
  Network,
  Server,
  ShieldCheck,
  TestTube,
} from 'lucide-react'

import { GithubIcon } from '~/components/icon/brand-icons'
import { ThemeModeToggle } from '~/components/ThemeModeToggle'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface SectionItem {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const HIGHLIGHTS: SectionItem[] = [
  {
    icon: FileCode2,
    title: '原生 TypeScript 支持',
    description:
      'Nest 完全采用 TypeScript 编写，保留了与原生 JavaScript 的兼容性。享受强类型带来的代码提示、重构便利及更少的运行时错误。',
  },
  {
    icon: Layers,
    title: '卓越的底层架构',
    description:
      '受 Angular 启发，Nest 提供了一套开箱即用的应用架构。通过依赖注入、模块化设计，让大型应用的团队协作变得轻松高效。',
  },
  {
    icon: Blocks,
    title: '极具扩展性的生态',
    description:
      '底层完美融合 Express 或 Fastify。丰富的官方及社区模块，从数据库 ORM、GraphQL 到微服务，一应俱全，无缝集成。',
  },
]

const FEATURES: SectionItem[] = [
  {
    icon: Cpu,
    title: '控制器 (Controllers)',
    description: '负责处理传入的请求并将响应返回给客户端。基于装饰器实现优雅的路由管理。',
  },
  {
    icon: Network,
    title: '提供者 (Providers)',
    description: 'Nest 的基本概念，许多类可以被视为 provider。通过依赖注入（DI）管理对象关系。',
  },
  {
    icon: LayoutTemplate,
    title: '模块 (Modules)',
    description: '用于组织代码的元数据，定义了应用结构的根目录，有效封装领域逻辑。',
  },
  {
    icon: ShieldCheck,
    title: '守卫 (Guards)',
    description: '单职责，负责决定请求是否应该由路由处理器处理，完美的鉴权解决方案。',
  },
  {
    icon: Filter,
    title: '拦截器 (Interceptors)',
    description: '在函数执行之前/之后绑定额外的逻辑，转换函数返回的结果或抛出的异常。',
  },
  {
    icon: Database,
    title: '微服务 (Microservices)',
    description: '内置多种传输器支持（Redis, MQTT, RabbitMQ, gRPC 等），轻松构建分布式系统。',
  },
  {
    icon: Server,
    title: 'GraphQL',
    description: '提供代码优先和模式优先两种集成方式，结合 Apollo 让构建 GraphQL API 变得简单。',
  },
  {
    icon: TestTube,
    title: '测试 (Testing)',
    description: '集成了 Jest，并提供自动模拟、测试应用容器等开箱即用的单元及端到端测试工具。',
  },
]

export default function HomePage() {
  // Navbar 滚动状态
  const [isScrolled, setIsScrolled] = useState(false)

  // 监听滚动 → 更新 Navbar 背景
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 z-99 w-full pb-4 transition-all duration-300 text-foreground-accent',
          isScrolled
            ? 'bg-linear-to-b from-background via-background/97 to-transparent'
            : 'bg-transparent',
        )}
      >
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href="/">
              <Image
                alt="NestJS Logo"
                className="rounded-lg"
                height={32}
                src="/logos/logo-128.png"
                width={32}
              />
              <span className="font-bold text-lg">
                NestJS 中文文档
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <Link href="/docs">
                文档
              </Link>
              <Link href="https://api-references-nestjs.netlify.app/api" rel="noopener noreferrer" target="_blank">
                API 参考
              </Link>
              <Link href="https://enterprise.nestjs.com/" rel="noopener noreferrer" target="_blank">
                企业服务
              </Link>
            </nav>

            <div className="md:flex items-center gap-x-3">
              <Button
                render={<Link href="/docs" />}
                size="sm"
                variant="ghost"
              >
                开始阅读
              </Button>

              <ThemeModeToggle
                triggerButtonProps={{
                  size: 'sm',
                  variant: 'ghost',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-20">
        <div className="container mx-auto relative z-50">
          <div className="py-16 md:py-20 lg:py-32">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center rounded-lg bg-background/90 supports-backdrop-filter:bg-background/60 px-3 py-1 text-sm font-medium mb-6 backdrop-blur">
                  社区开发者维护的高质量中文文档
                </div>

                <h1 className="text-3xl leading-[1.4] font-bold sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground-accent">
                  NestJS 中文文档
                  <br />
                  <span>精校版 · 优化阅读体验</span>
                </h1>

                <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                  让中文开发者轻松掌握 NestJS 框架的最佳学习资源。不用翻墙、不看生涩英文，也能轻松学会 NestJS。
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button className="w-full sm:w-auto" render={<Link href="/docs" />} size="lg">
                    <BookOpen className="size-4" />
                    立即开始学习
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-12 @md:h-16 @xl:h-20" />

        <div className="color-bg">
          <div className="noise-bg z-20" />
          <div className="flex items-center z-10 absolute top-0 bottom-0 left-1/2 -translate-x-1/2">
            {
              Array.from({ length: 30 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative h-full w-[68.7969px] shrink-0 backdrop-blur-xl bg-linear-to-r from-black/1.5 to-white/3"
                />
              ))
            }
          </div>
        </div>
      </section>

      <section className="container mx-auto py-landing-section relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title}>
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-theme flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto py-landing-section bg-background relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-accent">
            掌握核心特性，提升开发效率
          </h2>
          <p className="font-medium text-lg max-w-2xl mx-auto text-foreground-accent/90">
            深入了解 NestJS 的核心概念，构建高内聚、低耦合的现代化服务端架构。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-muted text-foreground flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-linear-to-r from-[#ea2845] to-[#ea2868] py-20 relative z-10 overflow-hidden">
        <div className="container mx-auto">
          {/* 装饰光斑 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="text-center relative z-10 fade-up">
            <h2 className="text-3xl md:text-4xl text-background font-bold mb-6">
              准备好改变您开发后端应用的方式了吗？
            </h2>
            <p className="text-background/80 font-medium text-lg mb-10">
              立即查阅中文官方文档，体验前所未有的开发效能。
            </p>
            <Button
              className="text-foreground bg-background border-background hover:text-foreground hover:bg-background"
              render={<Link href="/docs" />}
              size="lg"
            >
              开启 NestJS 之旅
            </Button>
          </div>
        </div>
      </section>

      <footer className="container mx-auto py-landing-section relative z-10">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* 品牌信息列 */}
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  alt="NestJS Logo"
                  className="rounded-md"
                  height={24}
                  src="/logos/logo-32.png"
                  width={24}
                />
                <span className="text-lg font-bold tracking-tight">NestJS 中文社区</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                致力于为中文开发者提供最新、最准确的 NestJS 框架文档及周边生态资源，助力 Node.js 社区发展。
              </p>
              <div className="flex items-center gap-4">
                <Link className="text-muted-foreground hover:text-theme transition-colors" href="#">
                  <GithubIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* 资源链接 */}
            <div>
              <h4 className="font-bold mb-4">资源</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-theme transition-colors" href="/docs">
                    官方文档
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="https://api-references-nestjs.netlify.app/api" rel="noopener noreferrer" target="_blank">
                    API 参考
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="https://search.bilibili.com/all?keyword=NestJS" rel="noopener noreferrer" target="_blank">
                    视频教程
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="https://github.com/nestjs/nest/tree/master/sample" rel="noopener noreferrer" target="_blank">
                    示例库
                  </Link>
                </li>
              </ul>
            </div>

            {/* 生态链接 */}
            <div>
              <h4 className="font-bold mb-4">生态</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-theme transition-colors" href="/docs/cli/overview">CLI</Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="/docs/devtools/overview">Devtools</Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="https://awesome-nestjs.com/" rel="noopener noreferrer" target="_blank">Awesome NestJS</Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="https://enterprise.nestjs.com/" rel="noopener noreferrer" target="_blank">企业咨询</Link>
                </li>
              </ul>
            </div>

            {/* 贡献链接 */}
            <div>
              <h4 className="font-bold mb-4">贡献</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-theme transition-colors" href="#">参与翻译</Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="#">报告文档问题</Link>
                </li>
                <li>
                  <Link className="hover:text-theme transition-colors" href="#">加入社区组</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
