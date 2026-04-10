import type { SVGProps } from 'react'

import { MaterialIconThemeDocker, MaterialIconThemeDocument, MaterialIconThemeEslint, MaterialIconThemeGraphql, MaterialIconThemeGroovy, MaterialIconThemeHtml, MaterialIconThemeJavascript, MaterialIconThemeJson, MaterialIconThemeNest, MaterialIconThemeNodejs, MaterialIconThemePowershell, MaterialIconThemeTsconfig, MaterialIconThemeTypescript, MaterialIconThemeWebpack, MaterialIconThemeYaml } from '~/components/icon/file-icons'

interface LanguageIconProps {
  lang: string
  filename?: string
  className?: string
}

// 定义支持的语言类型
type SupportedLanguage
  = | 'typescript' | 'ts'
    | 'javascript' | 'js'
    | 'html'
    | 'json'
    | 'yaml' | 'yml'
    | 'shell' | 'sh' | 'bash' | 'groovy' | 'graphql'
    | 'docker' | 'dockerfile'

// 图标组件类型
type IconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement

// 特定文件名到图标的映射
const filenameIconMap: Record<string, IconComponent | undefined> = {
  // NestJS 配置文件
  'nest-cli.json': MaterialIconThemeNest,

  // Webpack 配置文件
  'webpack.config.js': MaterialIconThemeWebpack,
  'webpack.config.ts': MaterialIconThemeWebpack,
  'webpack.config.mjs': MaterialIconThemeWebpack,
  'webpack.config.cjs': MaterialIconThemeWebpack,
  'webpack.dev.js': MaterialIconThemeWebpack,
  'webpack.prod.js': MaterialIconThemeWebpack,
  'webpack.common.js': MaterialIconThemeWebpack,

  // Docker 文件
  Dockerfile: MaterialIconThemeDocker,
  dockerfile: MaterialIconThemeDocker,
  'docker-compose.yml': MaterialIconThemeDocker,
  'docker-compose.yaml': MaterialIconThemeDocker,

  'package.json': MaterialIconThemeNodejs,
  'tsconfig.json': MaterialIconThemeTsconfig,
  'eslint.config.mjs': MaterialIconThemeEslint,
}

const iconMap: Record<SupportedLanguage, IconComponent> = {
  // 编程语言
  typescript: MaterialIconThemeTypescript,
  ts: MaterialIconThemeTypescript,
  javascript: MaterialIconThemeJavascript,
  js: MaterialIconThemeJavascript,
  groovy: MaterialIconThemeGroovy,
  graphql: MaterialIconThemeGraphql,

  // 技术
  html: MaterialIconThemeHtml,
  docker: MaterialIconThemeDocker,
  dockerfile: MaterialIconThemeDocker,

  // 数据格式
  json: MaterialIconThemeJson,
  yaml: MaterialIconThemeYaml,
  yml: MaterialIconThemeYaml,

  // 文档和工具
  shell: MaterialIconThemePowershell,
  sh: MaterialIconThemePowershell,
  bash: MaterialIconThemePowershell,
}

/**
 * 检查语言是否被支持
 */
function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang.toLowerCase() in iconMap
}

/**
 * 语言图标组件
 * 根据传入的文件名或语言类型显示对应的图标
 * 文件名匹配的优先级高于语言类型匹配
 */
export function LanguageIcon(props: LanguageIconProps) {
  const { lang, filename, className = 'size-4' } = props

  // 优先根据文件名匹配图标
  if (filename) {
    const IconComponent = filenameIconMap[filename]

    if (IconComponent) {
      return <IconComponent className={className} />
    }
  }

  // 如果文件名没有匹配，则根据语言类型匹配
  const normalizedLang = lang.toLowerCase()

  if (!isSupportedLanguage(normalizedLang)) {
    return <MaterialIconThemeDocument className={className} />
  }

  const IconComponent = iconMap[normalizedLang]

  return <IconComponent className={className} />
}
