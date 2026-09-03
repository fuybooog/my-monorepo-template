import { Injectable } from '@nestjs/common'
import ExcelJS from 'exceljs'
import { BusinessException } from '@/exceptions/business-exception'
import {
  DEFAULT_MAX_IMPORT_ROWS,
  ExportColumnSpec,
  ImportCellValue,
  ImportDefinition,
  ImportFieldSpec,
  ImportRowResult,
  ParsedImportData,
} from './excel.types'

/** 模板下拉、批注等覆盖的最大行数（超出部分仅做取值校验，不写下拉样式） */
const TEMPLATE_STYLE_MAX_ROWS = 1000

const XLSX_MAGIC = 'PK' // xlsx 本质是 zip，文件头固定为 PK

// exceljs 自身类型与项目 @types/node 的 Buffer 泛型存在差异，
// 在边界处做最小化的类型对齐，避免污染内部实现。
type XlsxLoadInput = Parameters<ExcelJS.Workbook['xlsx']['load']>[0]
type XlsxWriteOutput = Awaited<ReturnType<ExcelJS.Workbook['xlsx']['writeBuffer']>>

function toNodeBuffer(value: XlsxWriteOutput): Buffer {
  const bytes = value as unknown as { buffer: ArrayBuffer; byteOffset: number; byteLength: number }
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

/** Cell 的 comment 属性在 exceljs 类型里缺失，仅运行时支持 */
type CommentableCell = ExcelJS.Cell & {
  comment?: {
    texts?: Array<{ text: string; author?: string }>
    margins?: Record<string, unknown>
  }
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  // exceljs 的公式/富文本/超链接等对象值：优先取展示结果
  if (typeof value === 'object') {
    const obj = value as {
      text?: unknown
      result?: unknown
      hyperlink?: unknown
      formula?: unknown
      richText?: Array<{ text?: unknown }>
    }
    const richText = obj.richText?.map((t) => String(t.text ?? '')).join('')
    const picked = obj.result ?? richText ?? obj.text ?? obj.hyperlink ?? obj.formula ?? ''
    const text = String(picked ?? '').trim()
    // 防公式注入：以 = 开头的单元格内容一律视为无效（通常会被必填/格式校验拦下）
    return text.startsWith('=') ? '' : text
  }
  const text = String(value).trim()
  return text.startsWith('=') ? '' : text
}

function isZipLike(buffer: Buffer): boolean {
  if (buffer.length < 2) return false
  return buffer[0] === XLSX_MAGIC.charCodeAt(0) && buffer[1] === XLSX_MAGIC.charCodeAt(1)
}

/**
 * 统一 Excel 引擎：模板生成、导入解析 + 公共校验、导出文件生成。
 * 与具体业务解耦，业务模块通过 ImportDefinition / ExportColumnSpec 接入。
 */
@Injectable()
export class ExcelService {
  // ---------------------------------------------------------------- 模板
  async buildImportTemplate(def: ImportDefinition): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(def.sheetName || '导入数据')

    const headerRow = sheet.getRow(1)
    headerRow.height = 28

    def.fields.forEach((field, index) => {
      const col = index + 1
      const headerText = field.required ? `${field.header} *` : field.header
      const cell = headerRow.getCell(col)
      cell.value = headerText

      // 表头批注：必填/提示/示例
      const commentParts: string[] = []
      commentParts.push(field.required ? '【必填】' : '【选填】')
      if (field.hint) commentParts.push(field.hint)
      if (field.example !== undefined) commentParts.push(`示例：${field.example}`)
      if (field.options?.length) {
        commentParts.push(`可选项：${field.options.map((o) => o.label).join('、')}`)
      }
      ;(cell as CommentableCell).comment = {
        texts: [{ text: commentParts.join('\n'), author: '系统' }],
      }

      // 下拉选项（标签是用户可填写的值）
      if (field.options?.length) {
        const list = field.options.map((o) => o.label).join(',')
        for (let r = 2; r <= TEMPLATE_STYLE_MAX_ROWS; r++) {
          sheet.getCell(r, col).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${list}"`],
            showErrorMessage: true,
            errorTitle: '输入无效',
            error: `仅支持：${field.options.map((o) => o.label).join('、')}`,
          }
        }
      }

      const width = field.width ?? Math.min(Math.max(headerText.length + 6, 12), 42)
      sheet.getColumn(col).width = width
    })

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: def.fields.length || 1 },
    }

    // 填写说明 sheet
    const noteSheet = workbook.addWorksheet('填写说明')
    noteSheet.columns = [{ width: 26 }, { width: 10 }, { width: 60 }, { width: 36 }]
    const noteHeader = noteSheet.getRow(1)
    noteHeader.values = ['列名', '是否必填', '填写说明', '示例']
    noteHeader.eachCell((cell) => {
      cell.font = { bold: true }
    })
    def.fields.forEach((field, index) => {
      const row = noteSheet.getRow(index + 2)
      row.values = [
        field.header,
        field.required ? '必填' : '选填',
        field.hint ?? '',
        field.example ?? '',
      ]
    })
    noteSheet.views = [{ state: 'frozen', ySplit: 1 }]

    return toNodeBuffer(await workbook.xlsx.writeBuffer())
  }

  // ---------------------------------------------------------------- 导入解析 + 公共校验
  /**
   * 解析导入文件：
   * 1. 表头与定义对齐（缺列/重复列会进入 headerErrors）；
   * 2. 逐行执行 必填 / 下拉枚举 / 最大长度 / 自定义 validate / transform；
   * 3. 纯空行自动跳过，行号保留 Excel 真实行号。
   */
  async parseImportFile(def: ImportDefinition, buffer: Buffer): Promise<ParsedImportData> {
    if (!buffer || buffer.length === 0 || !isZipLike(buffer)) {
      throw new BusinessException('文件内容不是有效的 .xlsx 文件')
    }

    let workbook: ExcelJS.Workbook
    try {
      workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer as unknown as XlsxLoadInput)
    } catch {
      throw new BusinessException('文件解析失败，请确认是未损坏的 .xlsx 文件')
    }
    const sheet = workbook.worksheets[0]
    if (!sheet) {
      throw new BusinessException('文件中没有可读取的工作表')
    }

    const headerErrors: string[] = []
    const headerRow = sheet.getRow(1)
    const maxCol = Math.max(headerRow.cellCount, 1)

    // 归一化表头：容忍模板中必填列的 " *" 后缀（下载模板后再上传的场景）
    const normalizeHeader = (text: string) => text.replace(/\s*\*+\s*$/, '').trim()

    // 读取表头，并检查重复列
    const headers: string[] = []
    const seenHeaders = new Set<string>()
    for (let col = 1; col <= maxCol; col++) {
      const raw = toCellText(headerRow.getCell(col).value)
      headers.push(raw)
      const normalized = normalizeHeader(raw)
      if (normalized) {
        if (seenHeaders.has(normalized)) {
          headerErrors.push(`表头「${raw}」重复，请检查模板格式`)
        }
        seenHeaders.add(normalized)
      }
    }
    const specByHeader = new Map<string, ImportFieldSpec>()
    for (const field of def.fields) {
      const normalized = normalizeHeader(field.header)
      if (!seenHeaders.has(normalized)) {
        headerErrors.push(`缺少列「${field.header}」`)
      } else {
        specByHeader.set(normalized, field)
      }
    }
    if (headerErrors.length > 0) {
      return { rows: [], headerErrors }
    }

    const maxRows = def.maxRows ?? DEFAULT_MAX_IMPORT_ROWS
    const rows: ImportRowResult[] = []
    let dataCount = 0

    // colIndex(1 起) -> spec
    const colSpec: (ImportFieldSpec | undefined)[] = []
    for (let col = 1; col <= maxCol; col++) {
      const normalized = normalizeHeader(headers[col - 1])
      colSpec.push(normalized ? specByHeader.get(normalized) : undefined)
    }

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const wsRow = sheet.getRow(rowNumber)
      const rowNo = rowNumber
      if (dataCount >= maxRows) {
        throw new BusinessException(`单次最多导入 ${maxRows} 行，请拆分文件后重试`)
      }

      // 读取该行各列文本
      const rawTexts: string[] = []
      let hasAnyContent = false
      for (let col = 1; col <= maxCol; col++) {
        const text = toCellText(wsRow.getCell(col).value)
        rawTexts.push(text)
        if (text !== '') hasAnyContent = true
      }
      if (!hasAnyContent) continue // 纯空行跳过

      const values: Record<string, ImportCellValue> = {}
      const errors: Record<string, string> = {}
      dataCount += 1

      for (let col = 1; col <= maxCol; col++) {
        const spec = colSpec[col - 1]
        if (!spec) continue
        const raw = rawTexts[col - 1] ?? ''
        const { header, key } = spec
        const addError = (message: string) => {
          errors[header] = errors[header] ? `${errors[header]}；${message}` : message
        }

        // 必填
        if (spec.required && raw === '') {
          addError(`${header}不能为空`)
          continue
        }
        if (raw === '') {
          values[key] = null
          continue
        }

        // 下拉枚举：label 或 value 均可
        let value: ImportCellValue = raw
        if (spec.options?.length) {
          const matched = spec.options.find((o) => o.label === raw || String(o.value) === raw)
          if (!matched) {
            addError(`${header}仅支持：${spec.options.map((o) => o.label).join('、')}`)
            continue
          }
          value = matched.value
        }

        // 最大长度
        if (spec.maxLength && raw.length > spec.maxLength) {
          addError(`${header}长度不能超过 ${spec.maxLength} 个字符`)
        }
        // 自定义校验（格式类）
        if (spec.validate) {
          const customError = await spec.validate(raw, rowNo)
          if (customError) addError(customError)
        }
        // 自定义转换（默认无，兜底给空值置 null）
        value = (await spec.transform?.(raw, rowNo)) ?? value

        values[key] = value === undefined ? null : value
      }

      rows.push({ rowNo, values, errors })
    }

    return { rows, headerErrors }
  }

  // ---------------------------------------------------------------- 导出
  async buildExportBuffer<T>(
    sheetName: string,
    columns: ExportColumnSpec<T>[],
    rows: T[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(sheetName || '导出数据')

    const headerRow = sheet.getRow(1)
    headerRow.height = 22
    columns.forEach((column, index) => {
      const col = index + 1
      headerRow.getCell(col).value = column.header
      sheet.getColumn(col).width =
        column.width ?? Math.min(Math.max(column.header.length + 4, 10), 40)
    })
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    rows.forEach((row, rowIndex) => {
      const wsRow = sheet.getRow(rowIndex + 2)
      columns.forEach((column, index) => {
        const value = column.formatter
          ? column.formatter(row)
          : ((row as Record<string, unknown>)[column.key] as ImportCellValue)
        wsRow.getCell(index + 1).value = value === undefined || value === null ? '' : value
      })
    })

    return toNodeBuffer(await workbook.xlsx.writeBuffer())
  }

  // ---------------------------------------------------------------- 公共
  /**
   * 生成附件下载的 Content-Disposition（兼容中文文件名）。
   * 例：attachment; filename="user-import-template.xlsx"; filename*=UTF-8''%E7%94%A8%E6%88%B7...xlsx
   */
  attachmentDisposition(fileName: string): string {
    const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_')
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
  }
}
