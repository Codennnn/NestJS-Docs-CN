#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DOCKER_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
REPO_ROOT=$(CDPATH= cd -- "$DOCKER_DIR/.." && pwd)
COMPOSE_FILE="$DOCKER_DIR/docker-compose.yml"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env.production}"
WEB_PORT="${WEB_PORT:-3001}"

log() {
  printf '%s\n' "$1"
}

if ! docker info >/dev/null 2>&1; then
  log "Docker is not running."
  exit 1
fi

cd "$REPO_ROOT"

COMPOSE_ARGS=(-f "$COMPOSE_FILE")
if [ -f "$ENV_FILE" ]; then
  log "Using env file: $ENV_FILE"
  COMPOSE_ARGS+=(--env-file "$ENV_FILE")
else
  log "[WARN] Env file not found at: $ENV_FILE"
  log "[WARN] 未在当前 shell 设置 NEXT_PUBLIC_* 时，构建产物会缺失搜索等客户端配置。"
  log "[WARN] 继续使用 compose 默认值与当前 shell 环境..."
fi

log "Starting the web container..."
docker compose "${COMPOSE_ARGS[@]}" up -d --build web

CONTAINER_ID=$(docker compose "${COMPOSE_ARGS[@]}" ps -q web)
if [ -z "$CONTAINER_ID" ]; then
  log "Failed to resolve the web container id."
  exit 1
fi

ATTEMPTS=30
SLEEP_SECONDS=2

for ((i = 1; i <= ATTEMPTS; i++)); do
  STATUS=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$CONTAINER_ID")

  if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "running" ]; then
    log "Container is ready."
    break
  fi

  if [ "$STATUS" = "unhealthy" ] || [ "$STATUS" = "exited" ] || [ "$STATUS" = "dead" ]; then
    log "Container became unhealthy. Recent logs:"
    docker compose "${COMPOSE_ARGS[@]}" logs --tail=50 web
    exit 1
  fi

  if [ "$i" -eq "$ATTEMPTS" ]; then
    log "Container did not become ready in time. Recent logs:"
    docker compose "${COMPOSE_ARGS[@]}" logs --tail=50 web
    exit 1
  fi

  sleep "$SLEEP_SECONDS"
done

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${WEB_PORT}/" || true)
if [[ "$HTTP_CODE" =~ ^(200|301|302|307|308|404)$ ]]; then
  log "Service is reachable on http://localhost:${WEB_PORT} (HTTP ${HTTP_CODE})."
else
  log "Service started, but the local HTTP probe returned ${HTTP_CODE:-unknown}."
fi

docker compose "${COMPOSE_ARGS[@]}" ps
