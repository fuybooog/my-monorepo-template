export interface StatusConfig {
  text: string
  color: string
}
export const defaultStatusList = [
  { id: 1, name: '启用' },
  { id: 0, name: '禁用' },
] as const

const STATUS_COLOR_MAP: Record<string | number, string> = {
  1: 'success',
  0: 'error',
}

export const DEFAULT_STATUS_MAP: Record<string | number, StatusConfig> = defaultStatusList.reduce(
  (acc, item) => {
    acc[item.id] = {
      text: item.name,
      color: STATUS_COLOR_MAP[item.id] || 'default',
    }
    return acc
  },
  {} as Record<string | number, StatusConfig>,
)
