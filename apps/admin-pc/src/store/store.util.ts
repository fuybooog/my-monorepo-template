import { create as zustandCreate, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * 自动注入 devtools 的通用 create 工具函数
 * @param storeCreator Zustand 原生创建函数
 * @param name DevTools 中显示的 Store 名称
 */
export const create = <T extends object>(
  storeCreator: StateCreator<T, [['zustand/devtools', never]], []>,
  name: string,
) => {
  // 只在开发环境下开启 DevTools
  if (import.meta.env.DEV) {
    return zustandCreate<T>()(
      devtools(storeCreator, {
        name,
        enabled: true,
      }),
    )
  }

  // 生产环境不开启
  return zustandCreate<T>()(storeCreator as any)
}
