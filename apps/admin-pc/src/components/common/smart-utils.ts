/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnsType } from 'antd/es/table'

export const getColumnKey = (col: ColumnsType<any>[number]): string | undefined => {
  const rawKey = (col as any).dataIndex ?? col.key
  if (!rawKey) return undefined
  return Array.isArray(rawKey) ? rawKey.join('.') : String(rawKey)
}
