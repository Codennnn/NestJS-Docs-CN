'use client'

import { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { whoUseData } from '~/lib/data/who-use'
import { cn } from '~/lib/utils'

interface CompanyProps {
  logo: string
  url: string
  width?: string
  className?: string
}

function CompanyCard({ logo, url, width = '120px', className }: CompanyProps) {
  // 从 URL 提取公司名称
  const getCompanyName = (url: string) => {
    try {
      const hostname = new URL(url).hostname

      return hostname.replace('www.', '').replace('.com', '').replace('.io', '').replace('.org', '')
    }
    catch {
      return 'Company'
    }
  }

  return (
    <div className={cn('group hover:shadow-md transition-shadow duration-200 bg-background/50 backdrop-blur-sm rounded-lg border', className)}>
      <div className="p-4 flex items-center justify-center min-h-[80px]">
        <Link
          className="flex items-center justify-center w-full h-full group-hover:scale-105 transition-transform duration-200"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt={`${getCompanyName(url)} logo`}
            className="object-contain max-w-full max-h-full filter grayscale group-hover:grayscale-0 transition-all duration-200"
            height={60}
            src={logo}
            style={{ width: width }}
            width={parseInt(width) || 120}
          />
        </Link>
      </div>
    </div>
  )
}

function CompanyLink({ url }: { url: string }) {
  const getCompanyName = (url: string) => {
    try {
      const hostname = new URL(url).hostname

      return hostname.replace('www.', '')
    }
    catch {
      return url
    }
  }

  return (
    <Link
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {getCompanyName(url)}
      <ExternalLink className="size-3" />
    </Link>
  )
}

export function CompaniesGrid() {
  const [showAllCompanies, setShowAllCompanies] = useState(false)

  // 显示的公司列表数量控制
  const visibleCompanies = showAllCompanies
    ? whoUseData.Body
    : whoUseData.Body.slice(0, 20)

  return (
    <div className="space-y-8">
      {/* 主要合作伙伴 */}
      <div>
        <h3 className="text-xl font-semibold mb-6 text-center">主要合作伙伴</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {whoUseData.Header.map((company, index) => {
            return (
              <CompanyCard
                key={index}
                logo={company.logo}
                url={company.url}
                width={company.width}
              />
            )
          })}
        </div>
      </div>

      {/* 更多使用企业 */}
      <div>
        <h3 className="text-xl font-semibold mb-6 text-center">更多使用企业</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleCompanies.map((url, index) => {
            return (
              <div key={index} className="p-3 rounded-lg border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200">
                <CompanyLink url={url} />
              </div>
            )
          })}
        </div>

        {whoUseData.Body.length > 20 && (
          <div className="flex justify-center mt-6">
            <Button
              className="gap-2"
              variant="outline"
              onClick={() => {
                setShowAllCompanies(!showAllCompanies)
              }}
            >
              {showAllCompanies
                ? (
                    <>
                      收起
                      <ChevronUp className="size-4" />
                    </>
                  )
                : (
                    <>
                      查看更多 (
                      {whoUseData.Body.length - 20}
                      {' '}
                      家企业)
                      <ChevronDown className="size-4" />
                    </>
                  )}
            </Button>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="text-center text-sm text-muted-foreground mt-8 p-6 bg-muted/30 rounded-lg">
        <p>
          以上企业信息来源于公开资料和社区贡献。如果您的企业也在使用 NestJS，
          <Link
            className="text-primary hover:underline ml-1"
            href="https://github.com/nestjs/nest/issues/1006"
            rel="noopener noreferrer"
            target="_blank"
          >
            欢迎提交您的企业信息
          </Link>
          。
        </p>
      </div>
    </div>
  )
}
