import resourceApi from '@/features/resource/api/resource'
import { useEffect, useState, useMemo, useRef } from 'react'
import { arrayToTree } from '@/utils'
import { Menu, MenuProps } from 'antd'
import { Backend } from '@repo/types'
import './LayoutAside.css'
import { useLocation, useNavigate } from 'react-router-dom'

export function LayoutAside() {
  const location = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState<MenuProps['items']>([])
  const [nodeMap, setNodeMap] = useState<Map<string | number, Backend.ResourcePageRespDto>>(
    new Map(),
  )

  // 仅记录用户手动展开/收起的状态
  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([])
  const prevOpenKeysRef = useRef<string[]>([])

  useEffect(() => {
    async function fetchResource() {
      const res = await resourceApi.listByUser({ types: '0,1', notInMenu: 0 })
      const treeConfig = {
        idKey: 'uniqueProp',
        parentKey: 'parentUniqueProp',
        transformNode: (
          node: Backend.ResourcePageRespDto,
          children: Backend.ResourcePageRespDto[],
        ) => ({
          key: node.uniqueProp,
          label: node.label,
          ...(children.length ? { children } : {}),
        }),
      } as const
      const { tree, nodeMap } = arrayToTree(res.data.list, treeConfig)
      setItems(tree as unknown as MenuProps['items'])
      setNodeMap(nodeMap)
    }
    fetchResource()
  }, [])

  // 1. 根据当前 location.pathname 实时计算高亮项和需要展开的父级项
  const { selectedKeys, currentParentKeys } = useMemo(() => {
    if (nodeMap.size === 0) return { selectedKeys: [], currentParentKeys: [] }

    const currentPath = location.pathname
    let targetKey: string | null = null

    for (const [key, node] of nodeMap.entries()) {
      if (node.menuPath && currentPath === node.menuPath) {
        targetKey = key as string
        break
      }
    }

    if (!targetKey) return { selectedKeys: [], currentParentKeys: [] }

    const parentKeys: string[] = []
    let currentNode = nodeMap.get(targetKey)
    while (currentNode) {
      const parentId = currentNode.parentUniqueProp
      if (parentId && nodeMap.has(parentId)) {
        parentKeys.push(parentId)
        currentNode = nodeMap.get(parentId)
      } else {
        break
      }
    }

    return {
      selectedKeys: [targetKey],
      currentParentKeys: parentKeys,
    }
  }, [location.pathname, nodeMap])

  // 2. 最终展开项 = 用户手动展开的项 + 当前路由必须展开的父级项（去重）
  const openKeys = useMemo(() => {
    return Array.from(new Set([...userOpenKeys, ...currentParentKeys]))
  }, [userOpenKeys, currentParentKeys])

  const onOpenChange = (keys: string[]) => {
    const prevOpenKeys = prevOpenKeysRef.current
    const addedKey = keys.find((k) => !prevOpenKeys.includes(k))

    if (addedKey && !currentParentKeys.includes(addedKey)) {
      setUserOpenKeys([addedKey])
    } else {
      setUserOpenKeys(keys.filter((k) => !currentParentKeys.includes(k)))
    }

    prevOpenKeysRef.current = keys
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const node = nodeMap.get(key)
    if (node?.menuPath) {
      navigate(node.menuPath)
    }
  }

  return (
    <div>
      <Menu
        onClick={handleMenuClick}
        style={{ width: '100%' }}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode="inline"
        items={items}
      />
    </div>
  )
}
