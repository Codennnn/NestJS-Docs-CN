#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 错误处理函数
handle_error() {
    log_error "脚本执行失败，退出码: $1"
    exit $1
}

# 设置错误处理
trap 'handle_error $?' ERR

echo "🚀 启动 Next.js Web 应用..."

# 切换到 docker 目录
cd "$(dirname "$0")/.."

# 检查 Docker Compose 文件是否存在
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml 文件不存在"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    log_error "Docker 未运行，请先启动 Docker"
    exit 1
fi

# 获取项目名称（当前目录名）
PROJECT_NAME=$(basename "$(pwd)")

log_info "检查现有容器状态..."

# 检查是否有同名的容器正在运行
RUNNING_CONTAINERS=$(docker-compose ps -q 2>/dev/null || true)

if [ -n "$RUNNING_CONTAINERS" ]; then
    log_warning "发现正在运行的容器，准备停止..."
    
    # 显示当前运行的容器
    echo ""
    log_info "当前运行的容器："
    docker-compose ps
    echo ""
    
    # 优雅停止容器
    log_info "正在停止现有容器..."
    if docker-compose down --timeout 30; then
        log_success "现有容器已成功停止"
    else
        log_warning "优雅停止失败，尝试强制停止..."
        docker-compose down --timeout 5 || true
    fi
    
    # 清理悬挂的容器（如果有的话）
    DANGLING_CONTAINERS=$(docker ps -aq --filter "name=${PROJECT_NAME}" --filter "status=exited" 2>/dev/null || true)
    if [ -n "$DANGLING_CONTAINERS" ]; then
        log_info "清理已停止的容器..."
        docker rm $DANGLING_CONTAINERS >/dev/null 2>&1 || true
    fi
else
    log_info "未发现运行中的容器"
fi

# 清理悬挂的镜像（可选，谨慎使用）
# log_info "清理悬挂的镜像..."
# docker image prune -f >/dev/null 2>&1 || true

# 启动服务
echo ""
log_info "启动 Docker 服务..."

# 构建并启动容器
if docker-compose up -d --build; then
    log_success "容器启动成功！"
else
    log_error "容器启动失败"
    exit 1
fi

# 等待容器完全启动
log_info "等待容器完全启动..."
sleep 3

# 验证容器状态
echo ""
log_info "验证容器状态..."
if docker-compose ps | grep -q "Up"; then
    log_success "所有容器运行正常！"
    
    # 显示容器状态
    echo ""
    echo "📊 容器状态："
    docker-compose ps
    
    # 检查端口是否可访问
    echo ""
    log_info "检查服务可用性..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|404\|403"; then
        log_success "服务已可访问"
    else
        log_warning "服务可能还在启动中，请稍等片刻"
    fi
else
    log_error "部分容器启动失败"
    echo ""
    echo "📊 容器状态："
    docker-compose ps
    echo ""
    echo "📋 容器日志："
    docker-compose logs --tail=20
    exit 1
fi

echo ""
log_success "应用已成功启动！"
echo ""
echo "🎯 常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  查看实时日志: docker-compose logs -f web"
echo "  停止应用: docker-compose down"
echo "  重启应用: docker-compose restart"
echo "  重新构建: docker-compose up -d --build"
echo ""
echo "🌐 访问地址: http://localhost:3001"
echo "📊 查看状态: docker-compose ps"
echo "🔍 进入容器: docker-compose exec web sh"
