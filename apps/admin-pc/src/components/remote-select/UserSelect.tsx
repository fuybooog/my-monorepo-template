import React from 'react'
import { RemoteSelect, type RemoteSelectProps } from './RemoteSelect'
import userApi from '@/features/user/api/user'
import { Backend } from '@repo/types'

// 继承 RemoteSelect 的 Props，允许外部覆盖部分配置（比如改变 mode 或 placeholder）
export type UserSelectProps = Partial<RemoteSelectProps>

export const UserSelect: React.FC<UserSelectProps> = (props) => {
  // 1. 默认的远程分页搜索逻辑
  const defaultFetchApi = async (params: Record<string, unknown>) => {
    const { ...queryParams } = params
    const res = await userApi.page(queryParams, {
      autoCancelPrevious: 'remote-select-user',
      cacheOptions: { enable: false },
    })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  }

  // 2. 默认的根据 IDs 回显逻辑
  const defaultFetchByIdsApi = async (
    ids: (number | string)[],
  ): Promise<Backend.UserPageRespDto[]> => {
    const res = await userApi.findByIds(ids.join())
    return res.data.list
  }

  return (
    <RemoteSelect
      mode="multiple"
      fieldNames={{ label: 'userName', value: 'id' }}
      fetchApi={defaultFetchApi}
      fetchByIdsApi={defaultFetchByIdsApi}
      {...props} // 支持外部覆盖，比如 mode="single" 或自定义 fetchApi
    />
  )
}
