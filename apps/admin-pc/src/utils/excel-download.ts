/**
 * 文件下载相关工具(Blob 保存、Content-Disposition 文件名解析、CSV 生成)
 */

/** 从 Content-Disposition 解析文件名(RFC5987 filename* 优先,降级普通 filename) */
export function parseDispositionFilename(header?: string | null): string | null {
  if (!header) return null

  const star = /filename\*\s*=\s*(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header)
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim())
    } catch {
      // 解码失败时继续尝试普通 filename
    }
  }

  const plain = /filename\s*=\s*["']?([^"';]+)["']?/i.exec(header)
  return plain?.[1] ? plain[1].trim() : null
}

/** 触发浏览器下载 Blob 文件 */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** CSV 字段转义(逗号 / 引号 / 换行) */
function csvEscape(value: string | number | null | undefined): string {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** 二维数组转 CSV 内容(带 BOM,避免 Excel 打开中文乱码) */
export function toCsvString(rows: (string | number | null | undefined)[][]): string {
  return '\ufeff' + rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')
}

/** 下载文本类文件(默认 text/csv) */
export function downloadTextFile(
  content: string,
  filename: string,
  mime = 'text/csv;charset=utf-8',
) {
  saveBlob(new Blob([content], { type: mime }), filename)
}
