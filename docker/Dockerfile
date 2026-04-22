# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

# builder 阶段需要 devDependencies 执行 next build，因此不加 --prod
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ORAMA_PROJECT_ID
ARG NEXT_PUBLIC_ORAMA_API_KEY
ARG NEXT_PUBLIC_ALGOLIA_APP_ID
ARG NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
ARG NEXT_PUBLIC_ALGOLIA_INDEX_NAME

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ORAMA_PROJECT_ID=${NEXT_PUBLIC_ORAMA_PROJECT_ID}
ENV NEXT_PUBLIC_ORAMA_API_KEY=${NEXT_PUBLIC_ORAMA_API_KEY}
ENV NEXT_PUBLIC_ALGOLIA_APP_ID=${NEXT_PUBLIC_ALGOLIA_APP_ID}
ENV NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=${NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY}
ENV NEXT_PUBLIC_ALGOLIA_INDEX_NAME=${NEXT_PUBLIC_ALGOLIA_INDEX_NAME}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm build

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

WORKDIR /app

# libc6-compat 用于兼容 sharp 等依赖 glibc 符号的原生模块
RUN apk add --no-cache libc6-compat \
    && addgroup -S nodejs -g 1001 \
    && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 预建 .next/cache 并授权，供 ISR / on-demand revalidation 写入
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
