import { FieldMeta } from '@/modules/operation-log/operation-log.types'
import { RESOURCE_TYPE_TEXT } from '@/modules/resource/resource.import-export'

/**
 * 资源业务字段元数据：登记参与操作日志 diff 的字段。
 * - label：字段中文名（详情页/摘要展示）；
 * - format：存储值 -> 展示文本（如 status: 1 -> 启用、type: 0 -> 目录）。
 */
export const RESOURCE_FIELD_META: FieldMeta[] = [
  { field: 'label', label: '资源名称' },
  { field: 'uniqueProp', label: '资源编码' },
  { field: 'parentUniqueProp', label: '父级资源编码' },
  {
    field: 'type',
    label: '资源类型',
    format: (value) => {
      if (value === null || value === undefined || value === '') return null
      return RESOURCE_TYPE_TEXT[Number(value)] ?? String(value)
    },
  },
  {
    field: 'status',
    label: '状态',
    format: (value) => (value === 1 ? '启用' : value === 0 ? '禁用' : String(value ?? '')),
  },
  { field: 'sortNumber', label: '排序号' },
  {
    field: 'notInMenu',
    label: '菜单外',
    format: (value) => (value === 1 ? '是' : value === 0 ? '否' : String(value ?? '')),
  },
  { field: 'menuPath', label: '菜单路径' },
]
