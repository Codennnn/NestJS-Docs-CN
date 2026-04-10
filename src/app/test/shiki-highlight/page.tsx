import { transformerTwoslash } from '@shikijs/twoslash'
import { type BundledLanguage, codeToHtml } from 'shiki'

/**
 * Shiki 代码高亮组件
 *
 * 用于在测试页面中展示代码高亮效果
 */
interface CodeBlockProps {
  children: string
  lang: BundledLanguage
  title?: string
  enableTwoslash?: boolean
}

async function CodeBlock(props: CodeBlockProps) {
  const { children, lang, title, enableTwoslash = false } = props

  const transformers = enableTwoslash ? [transformerTwoslash()] : []

  const out = await codeToHtml(children, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    transformers,
  })

  return (
    <div className="space-y-2">
      {title && (
        <div className="text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: out }} />
    </div>
  )
}

export const metadata = {
  title: 'Shiki 代码高亮测试 - NestJS 中文文档',
  description: '测试 Shiki 代码高亮和 Twoslash 类型提示功能',
}

export default function ShikiHighlightTestPage() {
  return (
    <div className="space-y-8 px-test-page-x py-test-page-y">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shiki 代码高亮测试</h1>
          <p className="text-muted-foreground">
            测试 Shiki 代码高亮引擎的各种功能，包括多语言支持、Twoslash 类型提示、主题切换等
          </p>
        </div>
      </div>

      {/* 测试用例 1：TypeScript 基础语法 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">1. TypeScript 基础语法</h2>
          <p className="text-sm text-muted-foreground">
            测试 TypeScript 的基本语法高亮，包括类型注解、接口、泛型等
          </p>
        </div>

        <CodeBlock lang="typescript" title="TypeScript 接口和类型">
          {`interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

type UserRole = 'admin' | 'user' | 'guest'

class UserService {
  private users: Map<number, User> = new Map()

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const id = this.users.size + 1
    const user: User = { id, ...data }
    this.users.set(id, user)
    return user
  }
}`}
        </CodeBlock>
      </section>

      {/* 测试用例 2：Twoslash 类型提示 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">2. Twoslash 类型提示</h2>
          <p className="text-sm text-muted-foreground">
            测试 Twoslash 的类型提示功能，鼠标悬停可查看类型信息
          </p>
        </div>

        <CodeBlock enableTwoslash lang="typescript" title="带类型提示的 TypeScript 代码">
          {`const greeting: string = 'Hello, NestJS!'
console.log(greeting)

const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)`}
        </CodeBlock>
      </section>

      {/* 测试用例 3：JavaScript 代码 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">3. JavaScript 代码</h2>
          <p className="text-sm text-muted-foreground">
            测试 JavaScript 语法高亮
          </p>
        </div>

        <CodeBlock lang="javascript" title="JavaScript 异步函数">
          {`async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// 使用 Promise
fetchUserData(123)
  .then(user => console.log(user))
  .catch(err => console.error(err))`}
        </CodeBlock>
      </section>

      {/* 测试用例 4：Python 代码 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">4. Python 代码</h2>
          <p className="text-sm text-muted-foreground">
            测试 Python 语法高亮，包括装饰器、类定义等
          </p>
        </div>

        <CodeBlock lang="python" title="Python 类和装饰器">
          {`from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    id: int
    name: str
    email: str
    created_at: datetime

class UserRepository:
    def __init__(self):
        self.users: List[User] = []
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        """根据 ID 查找用户"""
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def create(self, name: str, email: str) -> User:
        """创建新用户"""
        user = User(
            id=len(self.users) + 1,
            name=name,
            email=email,
            created_at=datetime.now()
        )
        self.users.append(user)
        return user`}
        </CodeBlock>
      </section>

      {/* 测试用例 5：Rust 代码 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">5. Rust 代码</h2>
          <p className="text-sm text-muted-foreground">
            测试 Rust 语法高亮，包括所有权、生命周期等特性
          </p>
        </div>

        <CodeBlock lang="rust" title="Rust 结构体和实现">
          {`use std::collections::HashMap;

#[derive(Debug, Clone)]
struct User {
    id: u32,
    name: String,
    email: String,
}

struct UserService {
    users: HashMap<u32, User>,
}

impl UserService {
    fn new() -> Self {
        UserService {
            users: HashMap::new(),
        }
    }

    fn add_user(&mut self, user: User) {
        self.users.insert(user.id, user);
    }

    fn find_by_id(&self, id: u32) -> Option<&User> {
        self.users.get(&id)
    }
}

fn main() {
    let mut service = UserService::new();
    
    let user = User {
        id: 1,
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
    };
    
    service.add_user(user);
    
    if let Some(found_user) = service.find_by_id(1) {
        println!("Found user: {:?}", found_user);
    }
}`}
        </CodeBlock>
      </section>

      {/* 测试用例 6：Go 代码 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">6. Go 代码</h2>
          <p className="text-sm text-muted-foreground">
            测试 Go 语言语法高亮
          </p>
        </div>

        <CodeBlock lang="go" title="Go 结构体和方法">
          {`package main

import (
    "fmt"
    "time"
)

type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
}

type UserService struct {
    users map[int]*User
}

func NewUserService() *UserService {
    return &UserService{
        users: make(map[int]*User),
    }
}

func (s *UserService) AddUser(user *User) {
    s.users[user.ID] = user
}

func (s *UserService) FindByID(id int) (*User, bool) {
    user, exists := s.users[id]
    return user, exists
}

func main() {
    service := NewUserService()

    user := &User{
        ID:        1,
        Name:      "Alice",
        Email:     "alice@example.com",
        CreatedAt: time.Now(),
    }

    service.AddUser(user)

    if found, exists := service.FindByID(1); exists {
        fmt.Printf("Found user: %+v\\n", found)
    }
}`}
        </CodeBlock>
      </section>

      {/* 测试用例 7：JSON 配置文件 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">7. JSON 配置文件</h2>
          <p className="text-sm text-muted-foreground">
            测试 JSON 语法高亮
          </p>
        </div>

        <CodeBlock lang="json" title="package.json 示例">
          {`{
  "name": "nestjs-app",
  "version": "1.0.0",
  "description": "A NestJS application",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "typescript": "^5.1.3"
  }
}`}
        </CodeBlock>
      </section>

      {/* 测试用例 8：YAML 配置 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">8. YAML 配置</h2>
          <p className="text-sm text-muted-foreground">
            测试 YAML 语法高亮
          </p>
        </div>

        <CodeBlock lang="yaml" title="docker-compose.yml 示例">
          {`version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge`}
        </CodeBlock>
      </section>

      {/* 测试用例 9：SQL 查询 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">9. SQL 查询</h2>
          <p className="text-sm text-muted-foreground">
            测试 SQL 语法高亮
          </p>
        </div>

        <CodeBlock lang="sql" title="复杂 SQL 查询">
          {`-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章表
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 复杂查询：获取用户及其文章统计
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(p.id) as post_count,
    COUNT(CASE WHEN p.published = TRUE THEN 1 END) as published_count
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC
LIMIT 10;`}
        </CodeBlock>
      </section>

      {/* 测试用例 10：Shell 脚本 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">10. Shell 脚本</h2>
          <p className="text-sm text-muted-foreground">
            测试 Bash/Shell 语法高亮
          </p>
        </div>

        <CodeBlock lang="bash" title="部署脚本示例">
          {`#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo -e "\${GREEN}开始部署应用...\${NC}"

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo "Node.js 版本: $NODE_VERSION"

# 安装依赖
echo -e "\${YELLOW}安装依赖...\${NC}"
pnpm install --frozen-lockfile

# 运行测试
echo -e "\${YELLOW}运行测试...\${NC}"
pnpm test

# 构建应用
echo -e "\${YELLOW}构建应用...\${NC}"
pnpm build

# 备份旧版本
if [ -d "dist.old" ]; then
    rm -rf dist.old
fi

if [ -d "dist" ]; then
    mv dist dist.old
fi

# 部署新版本
echo -e "\${GREEN}部署完成！\${NC}"

# 重启服务
pm2 restart nestjs-app || pm2 start dist/main.js --name nestjs-app

echo -e "\${GREEN}应用已成功部署并重启\${NC}"`}
        </CodeBlock>
      </section>

      {/* 测试用例 11：单行代码 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">11. 单行代码</h2>
          <p className="text-sm text-muted-foreground">
            测试单行代码的高亮效果
          </p>
        </div>

        <CodeBlock lang="typescript" title="单行 TypeScript">
          {'const sum = (a: number, b: number): number => a + b'}
        </CodeBlock>

        <CodeBlock lang="javascript" title="单行 JavaScript">
          {'const greeting = name => `Hello, ${name}!`'}
        </CodeBlock>
      </section>

      {/* 测试用例 12：特殊字符和注释 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">12. 特殊字符和注释</h2>
          <p className="text-sm text-muted-foreground">
            测试特殊字符、注释、字符串等边界情况
          </p>
        </div>

        <CodeBlock lang="typescript" title="特殊字符测试">
          {`// 单行注释
/* 多行注释
   可以跨越多行 */

/**
 * JSDoc 注释
 * @param name 用户名称
 * @returns 问候语
 */
function greet(name: string): string {
  // 字符串中的特殊字符
  const emoji = '👋 🎉 ✨'
  const template = \`Hello, \${name}! \${emoji}\`

  // 正则表达式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/

  // 转义字符
  const escaped = "Line 1\\nLine 2\\tTabbed"

  // Unicode 字符
  const unicode = '\\u4F60\\u597D' // 你好

  return template
}

// 特殊运算符
const nullish = value ?? 'default'
const optional = obj?.property?.nested
const spread = { ...obj1, ...obj2 }
const rest = [first, ...remaining] = array`}
        </CodeBlock>
      </section>

      {/* 测试说明 */}
      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-semibold">测试检查清单</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>所有编程语言的语法高亮正确显示</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>主题在亮色/暗色模式下正确切换</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Twoslash 类型提示功能正常（如果启用）</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>单行和多行代码都能正确渲染</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>特殊字符、注释、字符串等边界情况处理正确</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>代码块的样式与项目整体风格一致</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>长代码块可以正常滚动</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>不同语言的关键字、函数、变量等都有正确的颜色区分</span>
          </div>
        </div>
      </section>
    </div>
  )
}
