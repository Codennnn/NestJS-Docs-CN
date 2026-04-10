import { CodeTab, CodeTabs } from '~/components/code/CodeTabs'

export const metadata = {
  title: 'CodeTabs 组件测试 - NestJS 中文文档',
  description: '测试 CodeTabs 多标签代码块组件的各种功能',
}

export default function CodeTabsTestPage() {
  return (
    <div className="space-y-8 px-test-page-x py-test-page-y">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">CodeTabs 组件测试</h1>
          <p className="text-muted-foreground">
            测试 CodeTabs 多标签代码块组件的各种功能和使用场景
          </p>
        </div>
      </div>

      {/* 测试用例 1：包管理器命令 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">1. 包管理器安装命令</h2>
          <p className="text-sm text-muted-foreground">
            展示不同包管理器安装依赖的命令，最常见的使用场景
          </p>
        </div>

        <CodeTabs>
          <CodeTab label="pnpm" lang="bash">
            pnpm install @nestjs/core @nestjs/common rxjs reflect-metadata
          </CodeTab>
          <CodeTab label="npm" lang="bash">
            npm install @nestjs/core @nestjs/common rxjs reflect-metadata
          </CodeTab>
          <CodeTab label="yarn" lang="bash">
            yarn add @nestjs/core @nestjs/common rxjs reflect-metadata
          </CodeTab>
        </CodeTabs>
      </section>

      {/* 测试用例 2：TypeScript 代码展示 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">2. NestJS 架构组件</h2>
          <p className="text-sm text-muted-foreground">
            展示 Controller、Service、Module 三个核心文件，测试带文件名的功能
          </p>
        </div>

        <CodeTabs>
          <CodeTab filename="app.controller.ts" label="Controller" lang="typescript">
            {`import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  getUsers() {
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];
  }
}`}
          </CodeTab>
          <CodeTab filename="app.service.ts" label="Service" lang="typescript">
            {`import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async findAll() {
    // 业务逻辑处理
    const users = await this.fetchUsers();
    return users;
  }

  private async fetchUsers() {
    // 数据库查询等操作
    return [];
  }
}`}
          </CodeTab>
          <CodeTab filename="app.module.ts" label="Module" lang="typescript">
            {`import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`}
          </CodeTab>
        </CodeTabs>
      </section>

      {/* 测试用例 3：配置文件对比 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">3. 配置文件对比</h2>
          <p className="text-sm text-muted-foreground">
            展示不同配置文件的内容，测试 JSON 语法高亮
          </p>
        </div>

        <CodeTabs>
          <CodeTab filename="nest-cli.json" label="nest-cli.json" lang="json">
            {`{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "tsconfig.build.json"
  }
}`}
          </CodeTab>
          <CodeTab filename="tsconfig.json" label="tsconfig.json" lang="json">
            {`{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}`}
          </CodeTab>
          <CodeTab filename="package.json" label="package.json" lang="json">
            {`{
  "name": "nestjs-app",
  "version": "0.0.1",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "typescript": "^5.1.3"
  }
}`}
          </CodeTab>
        </CodeTabs>
      </section>

      {/* 测试用例 4：数据库 ORM 对比 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">4. 数据库 ORM 配置</h2>
          <p className="text-sm text-muted-foreground">
            对比 TypeORM、Prisma、Mongoose 三种 ORM 的配置方式
          </p>
        </div>

        <CodeTabs>
          <CodeTab filename="app.module.ts" label="TypeORM" lang="typescript">
            {`import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class AppModule {}`}
          </CodeTab>
          <CodeTab filename="schema.prisma" label="Prisma" lang="typescript">
            {`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`}
          </CodeTab>
          <CodeTab filename="app.module.ts" label="Mongoose" lang="typescript">
            {`import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  ],
})
export class AppModule {}`}
          </CodeTab>
        </CodeTabs>
      </section>

      {/* 测试用例 5：简单代码切换 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">5. 简单代码示例</h2>
          <p className="text-sm text-muted-foreground">
            测试简短代码的展示效果
          </p>
        </div>

        <CodeTabs>
          <CodeTab label="TypeScript" lang="typescript">
            {`const greeting: string = 'Hello, NestJS!';
console.log(greeting);`}
          </CodeTab>
          <CodeTab label="JavaScript" lang="javascript">
            {`const greeting = 'Hello, NestJS!';
console.log(greeting);`}
          </CodeTab>
        </CodeTabs>
      </section>

      {/* 测试说明 */}
      <section className="space-y-4 border-t pt-8">
        <h2 className="text-2xl font-semibold">测试检查清单</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>点击不同的 tab 按钮能够切换显示不同的代码</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>每个 tab 都有独立的语法高亮</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>文件名正确显示在代码块头部</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>复制按钮功能正常，点击可复制代码</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>样式与现有的 CodeBlock 保持一致</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>每组 CodeTabs 的状态是独立的</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>长代码块的折叠/展开功能正常</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>响应式设计，在不同屏幕尺寸下都能正常显示</span>
          </div>
        </div>
      </section>
    </div>
  )
}
