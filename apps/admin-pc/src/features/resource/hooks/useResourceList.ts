import { SmartTableInstance } from '@/components/common'
import { Backend } from '@repo/types'
import { useCallback, useRef, useState } from 'react'
import resourceApi from '../api/resource'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '@/constants'
import { arrayToTree, arrayToTreeWithMeta, getMessage } from '@/utils'
import { ResourcePageRespDto } from '../types'

export function useResourceList() {
  // 默认只查询「在菜单中展示」的资源(notInMenu=0)，与左侧菜单保持一致
  const [searchParams, setSearchParams] = useState<Backend.ResourcePageDto>({ notInMenu: 0 })
  const [originList, setOriginList] = useState<Backend.ResourcePageRespDto[]>([])
  const [resourceTree, setResourceTree] = useState<ResourcePageRespDto[]>([])
  const [resourceNodeMap, setResourceNodeMap] = useState<Map<string | number, ResourcePageRespDto>>(
    new Map(),
  )
  const [resourceIdNodeMap, setResourceIdNodeMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())
  const [resourceParentMap, setResourceParentMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())

  const [resourceOriginTree, setResourceOriginTree] = useState<ResourcePageRespDto[]>([])
  const [resourceOriginNodeMap, setResourceOriginNodeMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())
  const [resourceOriginIdNodeMap, setResourceOriginIdNodeMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())
  const [resourceOriginParentMap, setResourceOriginParentMap] = useState<
    Map<string | number, ResourcePageRespDto>
  >(new Map())

  const smartTable = useRef<SmartTableInstance>(null)

  const refreshTable = useCallback(() => {
    smartTable.current?.refresh(true)
  }, [])

  const handleFetchData = useCallback(async (params?: Backend.ResourcePageDto) => {
    const res = await resourceApi.list({
      ...(params || {}),
    })
    const originData = res.data.list
    setOriginList(originData)
    const treeConfig = {
      idKey: 'uniqueProp',
      parentKey: 'parentUniqueProp',
    } as const
    const { tree, parentMap, nodeMap, idNodeMap } = arrayToTreeWithMeta<ResourcePageRespDto>(
      originData,
      treeConfig,
    )
    const {
      tree: originTree,
      parentMap: originParentMap,
      nodeMap: originNodeMap,
      idNodeMap: originIdNodeMap,
    } = arrayToTree(originData, treeConfig)
    setResourceTree(tree)
    setResourceNodeMap(nodeMap)
    setResourceIdNodeMap(idNodeMap)
    setResourceParentMap(parentMap)

    setResourceOriginTree(originTree)
    setResourceOriginNodeMap(originNodeMap)
    setResourceOriginIdNodeMap(originIdNodeMap)
    setResourceOriginParentMap(originParentMap)
    return {
      data: tree,
      originData,
      idNodeMap,
      parentMap,
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
      smartTable.current?.clearSelection()
    }
  }

  return {
    originList,
    resourceTree,
    resourceIdNodeMap,
    resourceNodeMap,
    resourceParentMap,
    resourceOriginTree,
    resourceOriginIdNodeMap,
    resourceOriginNodeMap,
    resourceOriginParentMap,
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
