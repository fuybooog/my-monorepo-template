import { useCallback, useMemo } from 'react'
import { PERMISSIONS } from '@repo/shared'
import { SmartTableExcelOptions, SmartTableExcelDownloadPayload } from '@/components/common'
import { EXCEL_MESSAGE } from '@/constants'
import { parseDispositionFilename } from '@/utils'
import operationLogApi, { type FileResponse } from '../api/operation-log'
import type { OperationLogPageQuery } from '../types'

/** 解析二进制响应:文件成功返回文件内容+文件名,业务失败(请求层已提示)返回 null */
function resolveFileResponse(res: FileResponse): SmartTableExcelDownloadPayload | null {
  if (res?.data instanceof Blob) {
    const filename = parseDispositionFilename(res.headers?.['content-disposition'])
    return { blob: res.data, filename: filename || undefined }
  }
  return null
}

/**
 * 操作日志列表导出能力（日志无导入，仅导出），
 * 直接作为 <SmartTable excel={...} /> 使用。
 */
export function useOperationLogExcel(searchParams: Partial<OperationLogPageQuery>) {
  const exportData = useCallback(async () => {
    const payload = resolveFileResponse(await operationLogApi.exportLogs(searchParams))
    if (!payload) return null
    return {
      ...payload,
      filename: payload.filename || EXCEL_MESSAGE.OPERATION_LOG_EXPORT_FILE_NAME,
    }
  }, [searchParams])

  return useMemo<SmartTableExcelOptions>(
    () => ({
      exportData,
      exportPermission: PERMISSIONS.SYS_OPERATION_LOG_LIST_EXPORT,
    }),
    [exportData],
  )
}
