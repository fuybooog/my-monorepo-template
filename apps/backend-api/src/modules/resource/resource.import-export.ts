/**
 * 资源 Excel 导入 / 导出 / 模板 的列定义。
 *
 * 只声明列与格式规则：模板生成、文件解析、公共格式校验由 excel.service 统一完成；
 * 唯一性、父级引用等涉及数据库的校验放在 resource.service 里做。
 */
import { ExportColumnSpec, ImportDefinition } from '@/modules/excel/excel.types'

/** 资源类型文案映射（与 dto 注释一致：0-目录 1-页面 2-按钮 3-列） */
export const RESOURCE_TYPE_TEXT: Record<number, string> = {
  0: '目录',
  1: '页面',
  2: '按钮',
  3: '列',
}

/** 资源导入列定义 */
export const RESOURCE_IMPORT_DEF: ImportDefinition = {
  moduleType: 'resource',
  fileName: '资源导入模板',
  sheetName: '资源导入',
  fields: [
    {
      key: 'uniqueProp',
      header: '资源编码',
      required: true,
      maxLength: 100,
      hint: '必填，唯一编码，系统中需唯一',
      example: 'system:user:list',
      width: 24,
    },
    {
      key: 'label',
      header: '资源名称',
      required: true,
      maxLength: 50,
      hint: '必填，如"用户管理"',
      example: '用户管理',
      width: 22,
    },
    {
      key: 'parentUniqueProp',
      header: '父级资源编码',
      maxLength: 100,
      hint: '选填，父级资源编码，须为本文件或系统中已有的资源编码',
      example: 'system:user',
      width: 24,
    },
    {
      key: 'type',
      header: '资源类型',
      options: [
        { label: '目录', value: 0 },
        { label: '页面', value: 1 },
        { label: '按钮', value: 2 },
        { label: '列', value: 3 },
      ],
      hint: '选填，默认页面',
      example: '页面',
      width: 12,
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
      key: 'sortNumber',
      header: '排序号',
      validate: (text) => {
        if (!text) return null
        return /^-?\d+$/.test(text) ? null : '排序号须为整数'
      },
      hint: '选填，同一父级下排序，越小越靠前',
      example: 1,
      width: 12,
    },
  ],
}

/** 导出行结构 */
export interface ResourceExportRow {
  id: string | number
  uniqueProp: string
  label: string
  parentUniqueProp: string
  typeText: string
  statusText: string
  sortNumber: string
  createdAtText: string
}

/** 资源导出列定义 */
export const RESOURCE_EXPORT_COLUMNS: ExportColumnSpec<ResourceExportRow>[] = [
  { header: '资源ID', key: 'id', width: 10 },
  { header: '资源编码', key: 'uniqueProp', width: 24 },
  { header: '资源名称', key: 'label', width: 22 },
  { header: '父级资源编码', key: 'parentUniqueProp', width: 24 },
  { header: '资源类型', key: 'typeText', width: 12 },
  { header: '状态', key: 'statusText', width: 10 },
  { header: '排序号', key: 'sortNumber', width: 10 },
  { header: '创建时间', key: 'createdAtText', width: 22 },
]
