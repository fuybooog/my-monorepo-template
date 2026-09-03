import { FieldMeta } from '@/modules/operation-log/operation-log.types'

/**
 * 用户业务字段元数据：登记参与操作日志 diff 的字段。
 * - label：字段中文名（详情页/摘要展示）；
 * - format：存储值 -> 展示文本（如状态 1 -> 启用）。
 */
export const USER_FIELD_META: FieldMeta[] = [
  { field: 'userName', label: '用户名' },
  { field: 'nickName', label: '昵称' },
  { field: 'gender', label: '性别' },
  { field: 'birth', label: '生日' },
  { field: 'mobile', label: '手机号' },
  { field: 'email', label: '邮箱' },
  { field: 'address', label: '地址' },
  { field: 'addressDetail', label: '地址详情' },
  { field: 'maritalStatus', label: '婚姻状况' },
  {
    field: 'status',
    label: '状态',
    format: (value) => (value === 1 ? '启用' : value === 0 ? '禁用' : String(value ?? '')),
  },
]
