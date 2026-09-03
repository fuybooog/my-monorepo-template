import { SmartTableInstance } from '@/components/common'
import { useCallback, useRef, useState } from 'react'
import dayjs from 'dayjs'
import operationLogApi from '../api/operation-log'
import type { OperationLogPageQuery } from '../types'

/**
 * 列表查询参数清洗：仅保留非空字段；dayjs 日期值统一转为 yyyy-MM-dd
 * （后端按日期范围处理：结束日期自动补全到当天 23:59:59）。
 */
function cleanSearchParams(raw: Record<string, unknown>): Partial<OperationLogPageQuery> {
  const params: Partial<OperationLogPageQuery> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || value === '') continue
    if (dayjs.isDayjs(value)) {
      params[key as keyof OperationLogPageQuery] = (value as dayjs.Dayjs).format(
        'YYYY-MM-DD',
      ) as never
      continue
    }
    params[key as keyof OperationLogPageQuery] = value as never
  }
  return params
}

export function useOperationLogList() {
  const [searchParams, setSearchParams] = useState<Partial<OperationLogPageQuery>>({})
  const smartTable = useRef<SmartTableInstance>(null)

  const refreshTable = useCallback(() => {
    smartTable.current?.refresh(true)
  }, [])

  const handleFetchData = useCallback(async (params: Partial<OperationLogPageQuery>) => {
    const res = await operationLogApi.page(params)
    return {
      data: res.data.list,
      total: res.data.total,
    }
  }, [])

  const searchTable = useCallback((formParams: Record<string, unknown>) => {
    setSearchParams(cleanSearchParams(formParams))
  }, [])

  return {
    searchParams,
    setSearchParams,
    smartTable,
    refreshTable,
    handleFetchData,
    searchTable,
  }
}
