import { useCallback, useRef, useState } from 'react'
import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import valueSetApi from '../api/value-set'
import { getMessage } from '@/utils/antd-instance'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'

/** 拉取某个集下所有值的 id（用于整集删除 / 整集状态变更，不走分页，直接按 setCode 查询全部） */
export async function fetchSetValueIds(setCode: string): Promise<number[]> {
  const res = await valueSetApi.getValueSetBySetCodes({ setCodes: setCode })
  const list = res.data?.list ?? []
  return list.map((item: { id: number }) => item.id)
}

export function useValueSetList() {
  const smartTable = useRef<SmartTableInstance>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const handleFetchData = useCallback(
    async (params: { page: number; pageSize: number; [key: string]: unknown }) => {
      const res = await valueSetApi.pageGroups(params)
      return {
        data: res.data.list,
        total: res.data.total,
      }
    },
    [],
  )

  const searchTable = useCallback((values: Record<string, unknown>) => {
    setSearchParams(values)
  }, [])

  const refreshTable = useCallback((resetPage = false) => {
    smartTable.current?.refresh(resetPage)
  }, [])

  /** 删除整集（按 setCode 删除其下所有值） */
  const onDelete = useCallback(
    async (record: Backend.ValueSetGroupPageRespDto) => {
      const ids = await fetchSetValueIds(record.setCode)
      if (!ids.length) {
        getMessage().error(ERROR_MESSAGE.DELETE)
        return
      }
      const res = await valueSetApi.batchDelete(ids.join())
      if (res.head.errCode === 0) {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
        refreshTable()
      }
    },
    [refreshTable],
  )

  /** 批量删除多个集（keys 为 setCode 数组） */
  const onBatchDelete = useCallback(
    async (keys: React.Key[]) => {
      const setCodes = keys as string[]
      const idSet = new Set<number>()
      for (const setCode of setCodes) {
        const ids = await fetchSetValueIds(setCode)
        ids.forEach((id) => idSet.add(id))
      }
      if (!idSet.size) {
        getMessage().error(ERROR_MESSAGE.DELETE)
        return
      }
      const res = await valueSetApi.batchDelete([...idSet].join())
      if (res.head.errCode === 0) {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
        refreshTable()
        smartTable.current?.clearSelection()
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
