/**
 * Excel 导入 / 导出 / 模板 的公共类型定义。
 *
 * 设计说明：
 * - 各业务模块只需要声明一份"列定义"(ImportDefinition / ExportColumnSpec)，
 *   模板生成、文件解析、公共格式校验全部由 excel.service 统一完成；
 * - 涉及数据库的校验（唯一性、引用角色是否存在等）留在业务模块里做
 *   （它们需要注入各自的 Repository），与这里的纯格式校验解耦。
 */

export type ImportCellValue = string | number | boolean | null | undefined

export interface ImportFieldOption {
  label: string
  value: string | number
}

export interface ImportFieldSpec {
  /** 转换后的字段 key，会写入到行的 values 中 */
  key: string
  /** Excel 表头（用于列映射与错误提示，需与模板表头完全一致） */
  header: string
  /** 是否必填（模板表头会追加 * 号，解析时必填列空值报错） */
  required?: boolean
  /** 模板中下拉选项：label 与 value 二选一均可填写；空值允许 */
  options?: ImportFieldOption[]
  /** 单元格文本最大长度校验 */
  maxLength?: number
  /**
   * 单元格自定义校验：入参为"去空格后的文本"，返回错误文案或 null。
   * 纯格式校验建议用 excel.validators 里公共的工厂函数拼装。
   */
  validate?: (text: string, rowNo: number) => string | null | Promise<string | null>
  /**
   * 单元格 -> 存储值的转换（默认：去空格文本，空值转 null）。
   * 注意：options 命中时 values[key] 为 option.value（保留原始类型）。
   */
  transform?: (text: string, rowNo: number) => ImportCellValue | Promise<ImportCellValue>
  /** 表头批注/填写提示（写入模板） */
  hint?: string
  /** 填写说明 sheet 中的示例（写入模板） */
  example?: string | number
  /** 模板列宽 */
  width?: number
}

export interface ImportDefinition {
  /** 模块标识，如 user */
  moduleType: string
  /** 模板/导出文件名前缀（不含扩展名） */
  fileName: string
  /** 模板 sheet 名 */
  sheetName: string
  fields: ImportFieldSpec[]
  /** 单次导入的最大数据行数（不含表头），超出直接报错，默认 10000 */
  maxRows?: number
}

export interface ImportRowResult {
  /** Excel 真实行号（用于前端错误定位） */
  rowNo: number
  values: Record<string, ImportCellValue>
  /** 错误：表头 -> 错误原因 */
  errors: Record<string, string>
}

export interface ParsedImportData {
  rows: ImportRowResult[]
  /** 表头级别的错误（缺列、重复列等），一旦存在应中止整次导入 */
  headerErrors: string[]
}

export interface ExportColumnSpec<T = Record<string, unknown>> {
  header: string
  /** 行对象的字段名 */
  key: keyof T & string
  width?: number
  formatter?: (row: T) => ImportCellValue
}

export const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const EXCEL_EXTENSION = 'xlsx'

/** 导入接口接收的上传文件（与 Express.Multer.File 兼容的字段子集） */
export interface ExcelUploadFile {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

export const DEFAULT_MAX_IMPORT_ROWS = 10000
