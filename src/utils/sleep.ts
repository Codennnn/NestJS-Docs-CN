/**
 * 异步延迟函数
 *
 * @param ms - 延迟的毫秒数
 * @returns Promise，在指定的毫秒数后 resolve
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
