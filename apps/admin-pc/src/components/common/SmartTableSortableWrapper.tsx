import React, { useCallback, useMemo, useState } from 'react'
import { TableProps } from 'antd'
import type { Key } from 'antd/es/table/interface'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SmartTableRow } from './SmartTableRow'
import type { TreeConfig } from '@/utils'
import { DragOrderChangeInfo } from '@/components/common/smart-types'

interface SmartTableSortableWrapperProps {
  children: React.ReactElement<TableProps<any>>
  treeConfig?: TreeConfig
  idNodeMap?: Map<Key, any>
  parentMap?: Map<Key, any>
  setDataSource?: (newDataSource: any[]) => void
  onOrderChange?: (newDataSource: any[], info?: DragOrderChangeInfo) => void
}

const getExpandedFlattenRowKeys = (
  list: any[],
  expandedKeysSet: Set<Key>,
  getRowKey: (record: any) => Key,
): Key[] => {
  return list.flatMap((node) => {
    const currentKey = getRowKey(node)
    const children = node.children // 假设你的子级属性名为 children

    if (Array.isArray(children) && children.length > 0 && expandedKeysSet.has(currentKey)) {
      return [currentKey, ...getExpandedFlattenRowKeys(children, expandedKeysSet, getRowKey)]
    }

    return [currentKey]
  })
}

export const SmartTableSortableWrapper: React.FC<SmartTableSortableWrapperProps> = ({
  children,
  treeConfig,
  idNodeMap,
  parentMap,
  setDataSource,
  onOrderChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
  )

  const {
    dataSource = [],
    rowKey = 'id',
    expandable,
    components: originComponents,
  } = children.props

  const expandedRowKeys = expandable?.expandedRowKeys
  const onExpandedRowsChange = expandable?.onExpandedRowsChange

  // 2. 统一将状态类型声明为 Key[]
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Key[]>([])
  const currentExpandedKeys = (expandedRowKeys ?? internalExpandedKeys) as Key[]

  // 辅助函数：提取 Key
  const getRecordRowKey = useCallback(
    (record: any): Key => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return record[rowKey]
    },
    [rowKey],
  )

  const treeIdKey = (treeConfig?.idKey as string) || 'id'
  const treeParentKey = (treeConfig?.parentKey as string) || 'parentId'
  const isTreeTable = Boolean(idNodeMap)

  const items = useMemo(() => {
    if (!isTreeTable) {
      return dataSource.map((record: any) => getRecordRowKey(record))
    }
    const expandedKeysSet = new Set(currentExpandedKeys)
    return getExpandedFlattenRowKeys(dataSource as any[], expandedKeysSet, getRecordRowKey)
  }, [dataSource, isTreeTable, currentExpandedKeys, getRecordRowKey])

  const moveTreeNode = (
    list: any[],
    activeRowKey: Key,
    overRowKey: Key,
  ): { updatedList: any[]; changedChildren: any[] | null } => {
    let changedChildren: any[] | null = null

    const updatedList = list.map((node) => {
      const children = node.children

      if (Array.isArray(children) && children.length > 0) {
        const activeIndex = children.findIndex(
          (child: any) => getRecordRowKey(child) === activeRowKey,
        )
        const overIndex = children.findIndex((child: any) => getRecordRowKey(child) === overRowKey)

        // 找到了目标层级，执行重排序
        if (activeIndex !== -1 && overIndex !== -1) {
          const newChildren = arrayMove(children, activeIndex, overIndex)
          changedChildren = newChildren // 记录变更后的局部列表
          return {
            ...node,
            children: newChildren,
          }
        }

        // 继续递归向下查找
        const result = moveTreeNode(children, activeRowKey, overRowKey)
        if (result.changedChildren) {
          changedChildren = result.changedChildren
        }
        return {
          ...node,
          children: result.updatedList,
        }
      }

      return node
    })

    return { updatedList, changedChildren }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!active.id || !over?.id || active.id === over.id) return

    const activeRowKey = active.id as Key
    const overRowKey = over.id as Key

    if (!isTreeTable) {
      const activeIndex = items.indexOf(activeRowKey)
      const overIndex = items.indexOf(overRowKey)

      if (activeIndex !== -1 && overIndex !== -1) {
        const newDataSource = arrayMove([...dataSource], activeIndex, overIndex)
        setDataSource?.(newDataSource)
        onOrderChange?.(newDataSource)
      }
      return
    }

    // const findNodeByRowKey = (list: any[], key: Key): any => {
    //   for (const item of list) {
    //     if (getRecordRowKey(item) === key) return item;
    //     if (Array.isArray(item.children)) {
    //       const found = findNodeByRowKey(item.children, key);
    //       if (found) return found;
    //     }
    //   }
    //   return null;
    // };

    // const activeItem = findNodeByRowKey(dataSource as any[], activeRowKey);
    // const overItem = findNodeByRowKey(dataSource as any[], overRowKey);
    const activeItem = idNodeMap?.get(activeRowKey)
    const overItem = idNodeMap?.get(overRowKey)

    if (!activeItem || !overItem) return

    const activeParent = activeItem[treeParentKey] ?? null
    const overParent = overItem[treeParentKey] ?? null
    if (activeParent !== overParent) return

    let newDataSource: any[]
    let updatedParentChildren: any[]

    const isTopLevel = dataSource.some((item: any) => getRecordRowKey(item) === activeRowKey)

    if (isTopLevel) {
      const activeIndex = dataSource.findIndex(
        (item: any) => getRecordRowKey(item) === activeRowKey,
      )
      const overIndex = dataSource.findIndex((item: any) => getRecordRowKey(item) === overRowKey)
      newDataSource = arrayMove([...dataSource], activeIndex, overIndex)
      updatedParentChildren = newDataSource // 顶层拖拽时，同级列表就是顶层数组
    } else {
      // 子节点移动
      const result = moveTreeNode([...dataSource], activeRowKey, overRowKey)
      newDataSource = result.updatedList
      updatedParentChildren = result.changedChildren || []
    }

    // 查找父节点信息
    const parentItem = activeParent ? parentMap?.get(activeItem[treeIdKey]) : null

    setDataSource?.(newDataSource)

    onOrderChange?.(newDataSource, {
      activeItem,
      overItem,
      parentItem, // 所属父节点
      parentChildren: updatedParentChildren, // 拖拽层级排序后的最新子节点数组
    })
  }

  const handleExpandedRowsChange = (expandedKeys: readonly Key[]) => {
    setInternalExpandedKeys([...expandedKeys])
    onExpandedRowsChange?.(expandedKeys)
  }

  const mergedComponents = {
    ...originComponents,
    body: {
      ...originComponents?.body,
      row: SmartTableRow,
    },
  }

  const mergedExpandable = isTreeTable
    ? {
        ...expandable,
        onExpandedRowsChange: handleExpandedRowsChange,
      }
    : expandable

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext items={items as UniqueIdentifier[]} strategy={verticalListSortingStrategy}>
        {React.cloneElement(children, {
          components: mergedComponents,
          expandable: mergedExpandable,
        })}
      </SortableContext>
    </DndContext>
  )
}
