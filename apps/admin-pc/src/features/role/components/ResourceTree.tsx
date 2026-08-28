import React, { useEffect, useMemo, useState } from 'react'
import { Tag, Tree } from 'antd'
import type { TreeProps } from 'antd'
import { useResourceList } from '@/features/resource/hooks/useResourceList'
import { filterRealCheckedKeys } from '@/utils'

interface ResourceTreeProps extends Omit<TreeProps, 'value' | 'onChange'> {
  value?: React.Key[]
  onChange?: (checkedKeys: React.Key[]) => void
}

const ResourceTree: React.FC<ResourceTreeProps> = (props) => {
  const { value: propCheckedKeys, onChange, onCheck: propOnCheck, ...restProps } = props
  const { resourceOriginTree, handleFetchData } = useResourceList()
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  useEffect(() => {
    const init = async () => {
      const { originData } = await handleFetchData()
      const originIdList = originData.map((item) => item.id)
      setExpandedKeys(originIdList)
    }
    init()
  }, [handleFetchData])

  // 1. 直接通过外部 propCheckedKeys 派生出组件所需的纯勾选节点（过滤掉半选）
  const displayCheckedKeys = useMemo(() => {
    if (!propCheckedKeys) return []
    if (Array.isArray(propCheckedKeys) && resourceOriginTree?.length) {
      return filterRealCheckedKeys(propCheckedKeys, resourceOriginTree)
    }
    return propCheckedKeys
  }, [propCheckedKeys, resourceOriginTree])

  // 2. 用户勾选时直接调用 onChange，将（全选 + 半选）传给外部表单
  const handleCheck: TreeProps['onCheck'] = (checkedKeysValue, info) => {
    const checked = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked
    const halfChecked = info.halfCheckedKeys ?? []

    // 传递全选 + 半选给 Form / 外部受控属性
    const allKeys = [...checked, ...halfChecked]
    onChange?.(allKeys)

    propOnCheck?.(checkedKeysValue, info)
  }

  const renderTitle = (nodeData: any) => {
    const isEnabled = nodeData.status === '1'

    // 1. 按钮 / 接口资源 (type 为 2 或 3)
    if (nodeData.type === '2' || nodeData.type === '3') {
      return (
        <span className="inline-flex items-center my-0.5">
          <Tag
            color={isEnabled ? 'blue' : 'default'}
            className={`
            mr-1 text-[10px] leading-[16px] px-1 py-0 rounded border-none transition-colors
            ${
              isEnabled
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-gray-100 !text-gray-400 border-gray-200 opacity-60'
            }
          `}
          >
            {nodeData.label}
            {!isEnabled && (
              <span className="ml-1.5 text-xs text-gray-400 font-normal no-underline">
                (已禁用)
              </span>
            )}
          </Tag>
        </span>
      )
    }

    // 2. 页面 / 目录资源
    return (
      <span
        className={`
        inline-flex items-center text-sm font-medium transition-colors
        ${isEnabled ? 'text-gray-800' : 'text-gray-400 line-through decoration-gray-300 opacity-70'}
        ${nodeData.notInMenu === '1' ? 'text-red-200' : ''}
      `}
      >
        {nodeData.label}
        {!isEnabled && (
          <span className="ml-1.5 text-xs text-gray-400 font-normal no-underline">(已禁用)</span>
        )}
      </span>
    )
  }

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue)
  }

  return (
    <Tree
      checkable
      onCheck={handleCheck}
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      checkedKeys={displayCheckedKeys}
      treeData={resourceOriginTree as any}
      fieldNames={{ title: 'label', key: 'id' }}
      titleRender={renderTitle}
      {...restProps}
    />
  )
}

ResourceTree.displayName = 'ResourceTree'
export default ResourceTree
