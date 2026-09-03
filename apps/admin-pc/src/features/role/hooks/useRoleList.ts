import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import { useCallback, useRef, useState } from 'react'
import roleApi from '../api/role'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'
import { getMessage } from '@/utils/antd-instance'

export function useRoleList() {
  const [searchParams, setSearchParams] = useState<Partial<Backend.RolePageDto>>({})
  const smartTable = useRef<SmartTableInstance>(null)

  const refreshTable = useCallback(() => {
    smartTable.current?.refresh(true)
  }, [])

  const handleFetchData = useCallback(async (params: Partial<Backend.RolePageDto>) => {
    const res = await roleApi.page({
      ...params,
    })
    return {
      data: res.data.list,
      total: res.data.total,
    }
  }, [])

  const searchTable = useCallback((formParams: Backend.RolePageDto) => {
    setSearchParams(formParams)
  }, [])

  const onDelete = async (record: Backend.RolePageRespDto) => {
    const res = await roleApi.delete(record.id)
    if (res.head.errCode === 0) {
      getMessage().success(SUCCESS_MESSAGE.DELETE)
      refreshTable()
    }
  }

  const onBatchDelete = async (keys: React.Key[]) => {
    const res = await roleApi.batchDelete(keys.join())
    if (res.head.errCode === 0) {
      if (res.data.notFoundIds?.length) {
        getMessage().error(ERROR_MESSAGE.DELETE)
      } else {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
      }
      refreshTable()
      smartTable.current?.clearSelection()
    }
  }

  return {
    searchParams,
    setSearchParams,
    smartTable,
    refreshTable,
    handleFetchData,
    searchTable,
    onDelete,
    onBatchDelete,
  }
}
