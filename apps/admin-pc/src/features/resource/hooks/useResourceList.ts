import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import { useCallback, useRef, useState } from 'react'
import resourceApi from '../api/resource'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'
import { arrayToTreeWithMeta, getMessage } from '@/utils'
import { ResourcePageRespDto } from '../types'

export function useResourceList() {
  const [searchParams, setSearchParams] = useState<Backend.ResourcePageDto>({})
  const [originList, setOriginList] = useState<Backend.ResourcePageRespDto[]>([])
  const [resourceTree, setResourceTree] = useState<ResourcePageRespDto[]>([])
  const [resourceParentMap, setResourceParentMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())
  const smartTable = useRef<SmartTableInstance>(null)

  const refreshTable = useCallback(() => {
    smartTable.current?.refresh(true)
  }, [])

  const handleFetchData = useCallback(async (params: Backend.ResourcePageDto) => {
    const res = await resourceApi.list({
      ...params,
    })
    setOriginList(res.data.list)
    const { tree, parentMap } = arrayToTreeWithMeta(res.data.list, {
      idKey: 'uniqueProp',
      parentKey: 'parentUniqueProp',
    })
    setResourceTree(tree)
    setResourceParentMap(parentMap)
    return {
      data: tree,
      total: 99999,
    }
  }, [])

  const searchTable = useCallback((formParams: ResourcePageRespDto) => {
    setSearchParams(formParams)
  }, [])

  const onDelete = async (record: ResourcePageRespDto) => {
    const res = await resourceApi.delete(record.id!)
    if (res.head.errCode === 0) {
      getMessage().success(SUCCESS_MESSAGE.DELETE)
      refreshTable()
    }
  }

  const onBatchDelete = async (keys: React.Key[]) => {
    const res = await resourceApi.batchDelete(keys.join())
    if (res.head.errCode === 0) {
      if (res.data.notFoundIds?.length) {
        getMessage().error(ERROR_MESSAGE.DELETE)
      } else {
        getMessage().success(SUCCESS_MESSAGE.DELETE)
      }
      refreshTable()
    }
  }

  return {
    originList,
    resourceTree,
    resourceParentMap,
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
