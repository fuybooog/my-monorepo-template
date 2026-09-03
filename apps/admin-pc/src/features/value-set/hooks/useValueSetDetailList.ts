import { useCallback, useRef, useState } from 'react'
import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import valueSetApi from '../api/value-set'
import { getMessage } from '@/utils/antd-instance'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'

/** 集下「值」列表（详情页使用） */
export function useValueSetDetailList(setCode: string) {
  const smartTable = useRef<SmartTableInstance>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({ setCode })

  const handleFetchData = useCallback(
    async (params: { page: number; pageSize: number; [key: string]: unknown }) => {
      const res = await valueSetApi.page({ ...params, setCode: `"${setCode}"` })
      return {
        data: res.data.list,
        total: res.data.total,
      }
    },
    [setCode],
  )

  const searchTable = useCallback(
    (values: Record<string, unknown>) => {
      setSearchParams({ ...values, setCode })
    },
    [setCode],
  )

  const refreshTable = useCallback((resetPage = false) => {
    smartTable.current?.refresh(resetPage)
  }, [])

  const onDelete = useCallback(
    async (record: Backend.ValueSetPageRespDto) => {
      const res = await valueSetApi.delete(record.id)
      if (res.head.errCode === 0) {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
        refreshTable()
      }
    },
    [refreshTable],
  )

  const onBatchDelete = useCallback(
    async (keys: React.Key[]) => {
      const res = await valueSetApi.batchDelete(keys.join())
      if (res.head.errCode === 0) {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
        refreshTable()
        smartTable.current?.clearSelection()
      } else {
        getMessage().error(ERROR_MESSAGE.DELETE)
      }
    },
    [refreshTable],
  )

  return {
    smartTable,
    searchParams,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  }
}
