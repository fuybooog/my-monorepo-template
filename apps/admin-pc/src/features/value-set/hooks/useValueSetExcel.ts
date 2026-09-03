import { useCallback, useMemo } from 'react'
import { ExcelImportResult } from '@repo/types'
import { PERMISSIONS } from '@repo/shared'
import { SmartTableExcelOptions, SmartTableExcelDownloadPayload } from '@/components/common'
import { EXCEL_MESSAGE } from '@/constants'
import { parseDispositionFilename } from '@/utils'
import valueSetApi, { type FileResponse } from '../api/value-set'

/** 解析二进制响应:文件成功返回文件内容+文件名,业务失败(请求层已提示)返回 null */
function resolveFileResponse(res: FileResponse): SmartTableExcelDownloadPayload | null {
  if (res?.data instanceof Blob) {
    const filename = parseDispositionFilename(res.headers?.['content-disposition'])
    return { blob: res.data, filename: filename || undefined }
  }
  return null
}

/**
 * 组装值集 Excel 导入导出能力(模板下载 / 导入 / 导出),直接作为 <SmartTable excel={...} /> 使用。
 * 详情页(单集值列表)与列表页(集列表)共用同一能力。
 *
 * @param searchParams 搜索条件(详情页为 code/name 等;列表页为 setCode/setCode、setName)
 * @param setCode 当前集编码;传入时导出精确限定当前集(详情页场景),不传则按 searchParams 原样透传导出(列表页场景)
 * @param onImportSuccess 导入成功后刷新列表
 */
export function useValueSetExcel(
  searchParams: Record<string, unknown>,
  setCode?: string,
  onImportSuccess?: () => void,
): SmartTableExcelOptions {
  const downloadTemplate = useCallback(async () => {
    const payload = resolveFileResponse(await valueSetApi.downloadValueSetTemplate())
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.VALUE_SET_TEMPLATE_FILE_NAME }
  }, [])

  const importFile = useCallback(async (file: File): Promise<ExcelImportResult | null> => {
    const res = await valueSetApi.importValueSetFile(file)
    return res.head.errCode === 0 ? res.data : null
  }, [])

  const exportData = useCallback(async () => {
    // 传入了 setCode:加引号精确匹配当前集(与详情页列表查询一致)
    // 未传入 setCode:直接透传 searchParams(集列表按 LIKE 筛选导出匹配的值,口径与列表一致)
    const exportParams = setCode ? { ...searchParams, setCode: `"${setCode}"` } : searchParams
    const payload = resolveFileResponse(await valueSetApi.exportValueSet(exportParams))
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.VALUE_SET_EXPORT_FILE_NAME }
  }, [searchParams, setCode])

  return useMemo<SmartTableExcelOptions>(
    () => ({
      importTitle: EXCEL_MESSAGE.VALUE_SET_IMPORT_TITLE,
      downloadTemplate,
      importFile,
      exportData,
      importPermission: PERMISSIONS.SYS_VALUE_SET_LIST_IMPORT,
      exportPermission: PERMISSIONS.SYS_VALUE_SET_LIST_EXPORT,
      onImportSuccess,
    }),
    [downloadTemplate, importFile, exportData, onImportSuccess],
  )
}
