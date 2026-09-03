/**
 * Excel 导入导出前端契约类型
 *
 * 与后端 ImportResultDto / ImportFailedRowDto 字段对齐(部分成功语义:成功行已落库,
 * 失败行在 failedRows 中逐行返回)。
 *
 * 说明:本文件为手工维护文件,不会被 packages/types 的 generate 脚本覆盖。
 * 待后端重新生成 openapi.json 后,若 components['schemas'] 已包含对应 DTO,
 * 可将下方类型替换为 components['schemas']['ImportResultDto'] 的引用。
 */

export interface ExcelImportFailedRow {
  /** 数据所在 Excel 行号(模板表头行不计入,为真实行号) */
  rowNo: number
  /** 校验失败明细:key=列名(中文表头), value=错误描述 */
  errors: Record<string, string>
}

/** 导入结果 */
export interface ExcelImportResult {
  /** 有效数据总条数 */
  total: number
  /** 成功导入条数 */
  successCount: number
  /** 失败条数 */
  failCount: number
  /** 失败行明细 */
  failedRows: ExcelImportFailedRow[]
}
