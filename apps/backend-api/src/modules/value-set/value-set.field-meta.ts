import { FieldMeta } from '@/modules/operation-log/operation-log.types'

/**
 * 字典值业务字段元数据：登记参与操作日志 diff 的字段。
 * 用于详情页/摘要展示（例如：状态 1 -> 启用）。
 */
export const VALUE_SET_FIELD_META: FieldMeta[] = [
  { field: 'setCode', label: '集编码' },
  { field: 'setName', label: '集名称' },
  { field: 'code', label: '值编码' },
  { field: 'name', label: '值名称' },
  {
    field: 'status',
    label: '状态',
    format: (value) => (value === 1 ? '启用' : value === 0 ? '禁用' : String(value ?? '')),
  },
  { field: 'sortNumber', label: '排序号' },
]
