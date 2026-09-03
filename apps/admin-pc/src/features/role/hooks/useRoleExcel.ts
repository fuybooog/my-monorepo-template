import { useCallback, useMemo } from 'react'
import { Backend, ExcelImportResult } from '@repo/types'
import { PERMISSIONS } from '@repo/shared'
import { SmartTableExcelOptions, SmartTableExcelDownloadPayload } from '@/components/common'
import { EXCEL_MESSAGE } from '@/constants'
import { parseDispositionFilename } from '@/utils'
import roleApi, { type FileResponse } from '../api/role'

/** 解析二进制响应:文件成功返回文件内容+文件名,业务失败(请求层已提示)返回 null */
function resolveFileResponse(res: FileResponse): SmartTableExcelDownloadPayload | null {
  if (res?.data instanceof Blob) {
    const filename = parseDispositionFilename(res.headers?.['content-disposition'])
    return { blob: res.data, filename: filename || undefined }
  }
  return null
}

/**
 * 组装角色列表页 Excel 导入导出能力(模板下载 / 导入 / 导出),
 * 直接作为 <SmartTable excel={...} /> 使用。
 */
export function useRoleExcel(
  searchParams: Partial<Backend.RolePageDto>,
  onImportSuccess: () => void,
): SmartTableExcelOptions {
  const downloadTemplate = useCallback(async () => {
    const payload = resolveFileResponse(await roleApi.downloadRoleTemplate())
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.ROLE_TEMPLATE_FILE_NAME }
  }, [])

  const importFile = useCallback(async (file: File): Promise<ExcelImportResult | null> => {
    const res = await roleApi.importRoleFile(file)
    return res.head.errCode === 0 ? res.data : null
  }, [])

  const exportData = useCallback(async () => {
    const payload = resolveFileResponse(await roleApi.exportRole(searchParams))
    if (!payload) return null
    return { ...payload, filename: payload.filename || EXCEL_MESSAGE.ROLE_EXPORT_FILE_NAME }
  }, [searchParams])

  return useMemo<SmartTableExcelOptions>(
    () => ({
      importTitle: EXCEL_MESSAGE.ROLE_IMPORT_TITLE,
      downloadTemplate,
      importFile,
      exportData,
      importPermission: PERMISSIONS.SYS_ROLE_LIST_IMPORT,
      exportPermission: PERMISSIONS.SYS_ROLE_LIST_EXPORT,
      onImportSuccess,
    }),
    [downloadTemplate, importFile, exportData, onImportSuccess],
  )
}
