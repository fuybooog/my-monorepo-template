import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import { useCallback, useRef, useState } from 'react'
import userApi from '../api/user'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'
import { getMessage } from '@/utils/antd-instance'

export function useUserList() {
  const [searchParams, setSearchParams] = useState<Backend.UserPageDto>({})
  const smartTable = useRef<SmartTableInstance>(null)

  const refreshTable = useCallback(() => {
    smartTable.current?.refresh(true)
  }, [])

  const handleFetchData = useCallback(async (params: Backend.UserPageDto) => {
    const res = await userApi.page({
      ...params,
    })
    return {
      data: res.data.list,
      total: res.data.total,
    }
  }, [])

  const searchTable = useCallback((formParams: Backend.UserPageDto) => {
    setSearchParams(formParams)
  }, [])

  const onDelete = async (record: Backend.UserPageRespDto) => {
    const res = await userApi.delete(record.id)
    if (res.head.errCode === 0) {
      getMessage().success(SUCCESS_MESSAGE.DELETE)
      refreshTable()
    }
  }

  const onBatchDelete = async (keys: React.Key[]) => {
    const res = await userApi.batchDelete(keys.join())
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
