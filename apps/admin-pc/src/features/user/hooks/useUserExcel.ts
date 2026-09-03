import { useCallback, useMemo } from 'react'
import { Backend, ExcelImportResult } from '@repo/types'
import { PERMISSIONS } from '@repo/shared'
import { SmartTableExcelOptions, SmartTableExcelDownloadPayload } from '@/components/common'
import { EXCEL_MESSAGE } from '@/constants'
import { parseDispositionFilename } from '@/utils'
import userApi, { type FileResponse } from '../api/user'

/** 解析二进制响应:文件成功返回文件内容+文件名,业务失败(请求层已提示)返回 null */
function resolveFileResponse(res: FileResponse): SmartTableExcelDownloadPayload | null {
  if (res?.data instanceof Blob) {
    const filename = parseDispositionFilename(res.headers?.['content-disposition'])
    return { blob: res.data, filename: filename || undefined }
  }
  return null
}

/**
 * 组装用户列表页 Excel 导入导出能力(模板下载 / 导入 / 导出),
 * 直接作为 <SmartTable excel={...} /> 使用。
 */
export function useUserExcel(
  searchParams: Backend.UserPageDto,
  onImportSuccess: () => void,
): SmartTableExcelOptions {
  const downloadTemplate = useCallback(async () => {
    const payload = resolveFileResponse(await userApi.downloadUserTemplate())
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.USER_TEMPLATE_FILE_NAME }
  }, [])

  const importFile = useCallback(async (file: File): Promise<ExcelImportResult | null> => {
    const res = await userApi.importUserFile(file)
    return res.head.errCode === 0 ? res.data : null
  }, [])

  const exportData = useCallback(async () => {
    const payload = resolveFileResponse(await userApi.exportUser(searchParams))
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.USER_EXPORT_FILE_NAME }
  }, [searchParams])

  return useMemo<SmartTableExcelOptions>(
    () => ({
      importTitle: EXCEL_MESSAGE.USER_IMPORT_TITLE,
      downloadTemplate,
      importFile,
      exportData,
      importPermission: PERMISSIONS.SYS_USER_LIST_IMPORT,
      exportPermission: PERMISSIONS.SYS_USER_LIST_EXPORT,
      onImportSuccess,
    }),
    [downloadTemplate, importFile, exportData, onImportSuccess],
  )
}
