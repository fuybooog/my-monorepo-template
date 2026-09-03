/**
 * 数据字典值 Excel 导入 / 导出 / 模板 的列定义。
 *
 * 只声明列与格式规则：模板生成、文件解析、公共格式校验由 excel.service 统一完成；
 * (setCode, code) 组合唯一性等涉及数据库的校验放在 value-set.service 里做。
 */
import { ExportColumnSpec, ImportDefinition } from '@/modules/excel/excel.types'

/** 值导入列定义 */
export const VALUE_SET_IMPORT_DEF: ImportDefinition = {
  moduleType: 'value-set',
  fileName: '字典值导入模板',
  sheetName: '字典值导入',
  fields: [
    {
      key: 'setCode',
      header: '集编码',
      required: true,
      maxLength: 50,
      hint: '必填，字典集编码（同集中多行共享）',
      example: 'user_status',
      width: 20,
    },
    {
      key: 'setName',
      header: '集名称',
      required: true,
      maxLength: 50,
      hint: '必填，字典集名称',
      example: '用户状态',
      width: 22,
    },
    {
      key: 'code',
      header: '值编码',
      required: true,
      maxLength: 50,
      hint: '必填，同一集编码下需唯一',
      example: 'active',
      width: 18,
    },
    {
      key: 'name',
      header: '值名称',
      required: true,
      maxLength: 50,
      hint: '必填，值的中文名称',
      example: '启用',
      width: 18,
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
      hint: '选填，同集内排序，越小越靠前',
      example: 1,
      width: 12,
    },
  ],
}

/** 导出行结构 */
export interface ValueSetExportRow {
  id: string | number
  setCode: string
  setName: string
  code: string
  name: string
  statusText: string
  sortNumber: string
  createdAtText: string
}

/** 值导出列定义 */
export const VALUE_SET_EXPORT_COLUMNS: ExportColumnSpec<ValueSetExportRow>[] = [
  { header: '字典ID', key: 'id', width: 10 },
  { header: '集编码', key: 'setCode', width: 20 },
  { header: '集名称', key: 'setName', width: 22 },
  { header: '值编码', key: 'code', width: 18 },
  { header: '值名称', key: 'name', width: 18 },
  { header: '状态', key: 'statusText', width: 10 },
  { header: '排序号', key: 'sortNumber', width: 10 },
  { header: '创建时间', key: 'createdAtText', width: 22 },
]
