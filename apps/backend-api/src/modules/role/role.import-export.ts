/**
 * 角色 Excel 导入 / 导出 / 模板 的列定义。
 *
 * 只声明列与格式规则：模板生成、文件解析、公共格式校验由 excel.service 统一完成；
 * 唯一性、角色等级权限等涉及数据库/登录态的校验放在 role.service 里做。
 */
import { ExportColumnSpec, ImportDefinition } from '@/modules/excel/excel.types'

/** 角色导入列定义 */
export const ROLE_IMPORT_DEF: ImportDefinition = {
  moduleType: 'role',
  fileName: '角色导入模板',
  sheetName: '角色导入',
  fields: [
    {
      key: 'roleCode',
      header: '角色编码',
      required: true,
      maxLength: 50,
      hint: '必填，角色编码，系统中需唯一',
      example: 'admin',
      width: 20,
    },
    {
      key: 'roleName',
      header: '角色名称',
      required: true,
      maxLength: 50,
      hint: '必填，角色名称，系统中需唯一',
      example: '系统管理员',
      width: 22,
    },
    {
      key: 'level',
      header: '角色等级',
      validate: (text) => {
        if (!text) return null
        return /^[1-9]\d*$/.test(text) ? null : '角色等级须为大于 0 的整数'
      },
      hint: '选填，数字越小权限越高；须小于当前账号的角色等级',
      example: 2,
      width: 14,
    },
    {
      key: 'status',
      header: '状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
      hint: '选填，默认启用',
      example: '启用',
      width: 12,
    },
  ],
}

/** 导出行结构（不含关联统计列，保持轻量） */
export interface RoleExportRow {
  id: string | number
  roleCode: string
  roleName: string
  level: string
  statusText: string
  createdAtText: string
}

/** 角色导出列定义 */
export const ROLE_EXPORT_COLUMNS: ExportColumnSpec<RoleExportRow>[] = [
  { header: '角色ID', key: 'id', width: 10 },
  { header: '角色编码', key: 'roleCode', width: 20 },
  { header: '角色名称', key: 'roleName', width: 22 },
  { header: '角色等级', key: 'level', width: 12 },
  { header: '状态', key: 'statusText', width: 10 },
  { header: '创建时间', key: 'createdAtText', width: 22 },
]
