# 使用官方 Node.js 22 镜像
FROM --platform=linux/amd64 node:22-alpine AS base

# pnpm registry（可通过 --build-arg NPM_REGISTRY=... 覆盖）
ARG NPM_REGISTRY=https://registry.npmmirror.com/
ENV npm_config_registry=${NPM_REGISTRY}
RUN npm install -g pnpm@9.15.3

# 设置工作目录
WORKDIR /app

# 复制 pnpm 配置文件
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# 复制所有必要的 package.json 文件
COPY apps/web/package.json ./apps/web/
COPY packages/constants/package.json ./packages/constants/
COPY packages/utils/package.json ./packages/utils/

# 安装依赖阶段
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod=false --registry=${npm_config_registry}

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/constants/node_modules ./packages/constants/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# 复制源代码
COPY apps/web ./apps/web
COPY packages/constants ./packages/constants
COPY packages/utils ./packages/utils

# 构建 workspace 包
RUN cd packages/constants && pnpm run build
RUN cd packages/utils && pnpm run build

# 设置工作目录到 web 应用
WORKDIR /app/apps/web

# 构建时环境变量 — 通过 CI/CD 的 --build-arg 注入，不在此设默认值
# 用法示例：
#   docker build \
#     --build-arg NODE_ENV=production \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://docs.example.com \
#     --build-arg NEXT_PUBLIC_ORAMA_API_KEY=<secret> \
#     -t nestjs-docs-web:latest .
ARG NODE_ENV
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ORAMA_PROJECT_ID
ARG NEXT_PUBLIC_ORAMA_API_KEY
ARG NEXT_PUBLIC_ALGOLIA_APP_ID
ARG NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
ARG NEXT_PUBLIC_ALGOLIA_INDEX_NAME=nestjs_docs_cn

ENV NODE_ENV=${NODE_ENV} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_ORAMA_PROJECT_ID=${NEXT_PUBLIC_ORAMA_PROJECT_ID} \
    NEXT_PUBLIC_ORAMA_API_KEY=${NEXT_PUBLIC_ORAMA_API_KEY} \
    NEXT_PUBLIC_ALGOLIA_APP_ID=${NEXT_PUBLIC_ALGOLIA_APP_ID} \
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=${NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY} \
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME=${NEXT_PUBLIC_ALGOLIA_INDEX_NAME}

# 生成 API 客户端并构建应用
RUN pnpm api:setup
RUN pnpm build

# 运行阶段
FROM --platform=linux/amd64 node:22-alpine AS runner
WORKDIR /app

# 运行阶段通常不再安装依赖，保留 pnpm 配置以保持一致性
ARG NPM_REGISTRY=https://registry.npmmirror.com/
ENV npm_config_registry=${NPM_REGISTRY}
RUN npm install -g pnpm@9.15.3

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# 设置正确的权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口（容器内部使用 8080）
EXPOSE 8080

# 运行时静态配置（不含凭据）
# 凭据类环境变量通过 docker run -e 或 docker-compose env_file 在运行时注入
ENV HOSTNAME="0.0.0.0" \
    PORT=8080

# 启动应用
CMD ["node", "apps/web/server.js"]
