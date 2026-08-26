import React from 'react'
import { RemoteSelect, type RemoteSelectProps } from './RemoteSelect'
import roleApi from '@/features/role/api/role'

// 继承 RemoteSelect 的 Props，允许外部覆盖部分配置（比如改变 mode 或 placeholder）
export type RoleSelectProps = Partial<RemoteSelectProps>

export const RoleSelect: React.FC<RoleSelectProps> = (props) => {
  // 1. 默认的远程分页搜索逻辑
  const defaultFetchApi = async (params: Record<string, unknown>) => {
    const { ...queryParams } = params
    const res = await roleApi.pageOptionRole(queryParams, {
      autoCancelPrevious: 'remote-select-role',
      cacheOptions: { enable: false },
    })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  }

  // 2. 默认的根据 IDs 回显逻辑
  const defaultFetchByIdsApi = async (ids: (number | string)[]) => {
    const res = await roleApi.findByIds(ids.join())
    return res.data.list
  }

  return (
    <RemoteSelect
      mode="multiple"
      fieldNames={{ label: 'roleName', value: 'id' }}
      fetchApi={defaultFetchApi}
      fetchByIdsApi={defaultFetchByIdsApi}
      {...props}
    />
  )
}
