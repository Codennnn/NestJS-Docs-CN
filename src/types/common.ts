/**
 * 通用的类型别名，用于替代 any 类型
 *
 * 主要目的：
 * - 通过显式声明来规避 TypeScript 的 strict 模式检查
 * - 在代码中清晰标识"有意使用 any"的场景
 *
 * 使用场景：
 * 1. 处理未知的 API 响应数据
 * 2. 处理动态或运行时确定的数据结构
 * 3. 与未提供类型定义的第三方库交互
 * 4. 在严格模式下确实需要使用 any 的情况
 * 5. 处理复杂的泛型或类型推导场景
 *
 * 注意事项：
 * - 这不是一个用于临时绕过类型检查的工具
 * - 使用此类型表明这里确实需要 any 的灵活性
 * - 优先考虑使用具体类型或 unknown
 * - 使用时添加注释说明使用原因是一个好的做法
 * - 应该作为经过充分考虑后的类型选择
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any

/**
 * @deprecated 这是一个临时的类型定义，用于暂时绕过 TypeScript 类型检查
 * TODO: 需要替换为具体的类型定义
 *
 * 警告：
 * 1. 这是一个不安全的类型定义，应该避免使用
 * 2. 使用此类型会失去 TypeScript 的类型安全保护
 * 3. 所有使用此类型的地方都需要重构，替换为明确的类型定义
 *
 * 查找使用位置：
 * 使用 IDE 的 "查找所有引用" 功能定位所有使用此类型的位置
 *
 * 重构建议：
 * 1. 对于 API 响应数据，定义具体的接口类型
 * 2. 对于配置对象，使用 Record<string, unknown> 或具体的配置接口
 * 3. 对于事件处理，使用 Event 或具体的事件类型
 * 4. 对于函数参数和返回值，明确指定类型或使用泛型
 * 5. 实在无法确定类型时，优先使用 unknown 而不是 any
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeAny = any

export interface PageProps<T> {
  params: Promise<T>
}

/**
 * 基础枚举配置接口
 *
 * 用于表示枚举的基本属性，如标签、外观、颜色等
 */
export interface BaseEnumConfig {
  /** 枚举名称 */
  label: string
  /** 参考前景色，通常用于文本、图标等 */
  frontColor?: string
  /** 参考背景色，通常用于图表、背景等 */
  bgColor?: string
}

/**
 * 枚举配置映射类型
 *
 * 用于将枚举值映射到其对应的配置信息
 *
 * @template T - 枚举值的类型
 * @template TConfig - 枚举配置的类型，默认为 BaseEnumConfig
 */
export type EnumConfig<
  T extends string | number,
  TConfig = BaseEnumConfig,
> = {
  [K in T]: TConfig & { value: K }
}
