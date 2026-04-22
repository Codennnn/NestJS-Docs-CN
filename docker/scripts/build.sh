#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DOCKER_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
REPO_ROOT=$(CDPATH= cd -- "$DOCKER_DIR/.." && pwd)
COMPOSE_FILE="$DOCKER_DIR/docker-compose.yml"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.production}"

echo "Building Docker image for the Next.js app..."

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running."
  exit 1
fi

cd "$REPO_ROOT"

COMPOSE_ARGS=(-f "$COMPOSE_FILE")
if [ -f "$ENV_FILE" ]; then
  echo "Using env file: $ENV_FILE"
  COMPOSE_ARGS+=(--env-file "$ENV_FILE")
else
  echo "[WARN] Env file not found at: $ENV_FILE"
  echo "[WARN] 未在当前 shell 设置 NEXT_PUBLIC_* 时，构建产物会缺失搜索等客户端配置。"
  echo "[WARN] 继续使用 compose 默认值与当前 shell 环境进行构建..."
fi

docker compose "${COMPOSE_ARGS[@]}" build web

echo "Build completed."
echo "Run with: docker compose ${COMPOSE_ARGS[*]} up -d web"
