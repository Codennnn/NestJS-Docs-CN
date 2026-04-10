'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

import { ThemeModeToggle } from '~/components/ThemeModeToggle'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import logo from '/public/logos/logo-128.png'

export default function HomePage() {
  // 监听滚动位置状态
  const [isScrolled, setIsScrolled] = useState(false)

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 0)
    }

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll)

    // 组件卸载时清理事件监听器
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 z-50 w-full pb-4 transition-all duration-300 text-foreground-accent',
          isScrolled
            ? 'bg-gradient-to-b from-background via-background/97 to-transparent'
            : 'bg-transparent',
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href="/">
              <Image
                alt="NestJS Logo"
                className="rounded-lg"
                height={32}
                src={logo}
                width={32}
              />
              <span className="font-bold text-lg">
                NestJS 中文文档
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <button
                className="cursor-pointer"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                特色功能
              </button>
              <button
                className="cursor-pointer"
                onClick={() => {
                  document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                适用人群
              </button>
              <button
                className="cursor-pointer"
                onClick={() => {
                  document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                支持项目
              </button>
            </nav>

            <div className="md:flex items-center space-x-3">
              <Button asChild size="sm" variant="ghost">
                <Link href="/docs">开始阅读</Link>
              </Button>

              <Button
                size="sm"
                onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}
              >
                支持项目
              </Button>

              <ThemeModeToggle triggerButtonProps={{ variant: 'ghost' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="@container relative pt-20">
        <div className="py-16 md:py-20 lg:py-32">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center rounded-lg bg-background/90 supports-[backdrop-filter]:bg-background/60 px-3 py-1 text-sm font-medium mb-6 backdrop-blur">
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
                <Button asChild className="w-full sm:w-auto" size="lg">
                  <Link href="/docs">
                    <BookOpen className="size-4" />
                    立即开始学习
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-12 @md:h-16 @xl:h-20" />

        <div className="color-bg">
          <div className="noise-bg" />
        </div>
      </section>
    </div>
  )
}
