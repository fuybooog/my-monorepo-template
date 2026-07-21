import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import { useCallback, useRef, useState } from 'react'
import userApi from '../api/user'
import { message } from 'antd'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'

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
      message.success(SUCCESS_MESSAGE.DELETE)
      refreshTable()
    }
  }

  const onBatchDelete = async (keys: React.Key[]) => {
    const res = await userApi.batchDelete(keys.join())
    if (res.head.errCode === 0) {
      if (res.data.notFoundIds?.length) {
        message.error(ERROR_MESSAGE.DELETE)
      } else {
        message.success(SUCCESS_MESSAGE.DELETE)
      }
      refreshTable()
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
