import { ExportColumnSpec, ImportDefinition } from '@/modules/excel/excel.types'
import { validators } from '@/modules/excel/excel.validators'

/**
 * 用户导入/导出的列定义（schema）。
 * 模板生成、公共校验、导出文件生成由 excel.service 统一执行；
 * 涉及数据库的校验（用户名/手机号/邮箱唯一性、角色引用是否有效）在 user.service 里处理。
 */

export const USER_IMPORT_DEF: ImportDefinition = {
  moduleType: 'user',
  fileName: '用户导入模板',
  sheetName: '用户导入',
  maxRows: 10000,
  fields: [
    {
      key: 'userName',
      header: '用户名',
      required: true,
      maxLength: 50,
      hint: '必填，登录账号，系统中需唯一',
      example: 'zhangsan',
      width: 18,
    },
    {
      key: 'nickName',
      header: '昵称',
      maxLength: 50,
      hint: '选填，用户昵称',
      example: '张三',
      width: 18,
    },
    {
      key: 'mobile',
      header: '手机号',
      maxLength: 20,
      validate: validators.mobile('手机号'),
      hint: '选填，系统中需唯一',
      example: '13800000000',
      width: 18,
    },
    {
      key: 'email',
      header: '邮箱',
      maxLength: 100,
      validate: validators.email('邮箱'),
      hint: '选填，系统中需唯一',
      example: 'zhangsan@example.com',
      width: 26,
    },
    {
      key: 'address',
      header: '地址',
      maxLength: 255,
      hint: '选填',
      width: 30,
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
    {
      key: 'roles',
      header: '角色',
      hint: '选填，多个角色用逗号/分号/顿号/空格分隔；须为系统中已存在的角色编码或角色名称',
      example: 'admin, editor',
      width: 36,
    },
  ],
}

/** 导出行的数据结构（由 user.service 从实体组装） */
export interface UserExportRow {
  id: string | number
  userName: string
  nickName: string
  genderName: string
  birth: string
  mobile: string
  email: string
  address: string
  statusText: string
  roleNames: string
  createdAtText: string
}

export const USER_EXPORT_COLUMNS: ExportColumnSpec<UserExportRow>[] = [
  { header: '用户ID', key: 'id', width: 14 },
  { header: '用户名', key: 'userName', width: 18 },
  { header: '昵称', key: 'nickName', width: 18 },
  { header: '性别', key: 'genderName', width: 10 },
  { header: '生日', key: 'birth', width: 14 },
  { header: '手机号', key: 'mobile', width: 18 },
  { header: '邮箱', key: 'email', width: 30 },
  { header: '地址', key: 'address', width: 32 },
  { header: '状态', key: 'statusText', width: 10 },
  { header: '角色', key: 'roleNames', width: 40 },
  { header: '创建时间', key: 'createdAtText', width: 22 },
]
