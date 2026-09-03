import { FieldMeta } from '@/modules/operation-log/operation-log.types'

/**
 * 角色业务字段元数据：登记参与操作日志 diff 的字段。
 * roleCode/roleName/level/status 为核心字段，userIds/resourceIds 的成员调整
 * 在 service 中单独记录为 members 维度变更。
 */
export const ROLE_FIELD_META: FieldMeta[] = [
  { field: 'roleCode', label: '角色编码' },
  { field: 'roleName', label: '角色名称' },
  { field: 'level', label: '角色等级' },
  {
    field: 'status',
    label: '状态',
    format: (value) => (value === 1 ? '启用' : value === 0 ? '禁用' : String(value ?? '')),
  },
]
