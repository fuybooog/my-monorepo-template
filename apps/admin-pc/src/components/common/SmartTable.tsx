import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react'
import { Table, TableProps } from 'antd'
import { SorterResult } from 'antd/es/table/interface'
import { isEqual } from 'lodash'
import { SmartTableInstance, SmartTableProps } from './smart-types'
import { SmartTableToolbar } from './SmartTableToolbar'
import { SmartTableButtons } from './SmartTableButtons'
import { formatSortParams } from '@/utils'
import { getColumnKey, serializeFormValues } from './smart-utils'
import { SmartTableSortableWrapper } from './SmartTableSortableWrapper'
import { HolderOutlined } from '@ant-design/icons'
import { DragHandleContext } from '@/components/common/SmartTableRowContext'

// ==========================================
// 1. Custom Hooks 拆分
// ==========================================

/** 列设置本地存储与过滤 Hook */
const useTableColumns = <RecordType extends object>({
  columns = [],
  storageKey,
  actionColumn,
  isDragSortable,
  onLinkClick,
}: {
  columns?: SmartTableProps<RecordType>['columns']
  storageKey?: string
  actionColumn?: SmartTableProps<RecordType>['actionColumn']
  isDragSortable?: boolean
  onLinkClick?: SmartTableProps<RecordType>['onLinkClick']
}) => {
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(() => {
    const allKeys = (columns || []).map((col) => getColumnKey(col)).filter(Boolean) as React.Key[]
    if (storageKey) {
      const localValue = localStorage.getItem(`table_cols_${storageKey}`)
      if (localValue) {
        try {
          return JSON.parse(localValue) as React.Key[]
        } catch (e) {
          console.error('获取 local 列配置报错', e)
        }
      }
    }
    return allKeys
  })

  const DragHandle: React.FC = () => {
    const { attributes, listeners } = useContext(DragHandleContext)

    return (
      <HolderOutlined
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          color: 'inherit',
          float: 'left',
          marginRight: 8,
          width: 'var(--ant-table-expand-icon-size)',
          height: 'var(--ant-table-expand-icon-size)',
          lineHeight: 'var(--ant-table-expand-icon-size)',
          textAlign: 'center',
          background: 'var(--ant-table-expand-icon-bg)',
          border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-table-border-color)',
          borderRadius: 'var(--ant-border-radius)',
          transform: 'scale(var(--ant-table-expand-icon-scale))',
          userSelect: 'none',
        }}
      />
    )
  }

  const handleCheckedKeysChange = (nextKeys: React.Key[]) => {
    if (!storageKey) return
    setCheckedKeys(nextKeys)
    if (storageKey) {
      localStorage.setItem(`table_cols_${storageKey}`, JSON.stringify(nextKeys))
    }
  }

  // 1. 根据勾选过滤列
  const filteredColumns = useMemo(() => {
    if (!storageKey) return columns || []
    return (columns || []).filter((col) => {
      const key = getColumnKey(col)
      if (!key) return true
      return checkedKeys.includes(key)
    })
  }, [columns, checkedKeys, storageKey])

  const processedColumns = useMemo(() => {
    return filteredColumns.map((col, index) => {
      const linkConfig = col.link
      const isFirstColumn = index === 0

      // 如果既不是第一列，也没有配置 link，直接返回原列定义
      if (!isFirstColumn && !linkConfig) return col

      return {
        ...col,
        render: (text: unknown, record: RecordType, recordIndex: number) => {
          // 获取原始的文字/节点内容
          let content: React.ReactNode = text as React.ReactNode

          if (col.render) {
            content = col.render(text, record, recordIndex) as React.ReactNode
          } else if (linkConfig) {
            const onClick = typeof linkConfig === 'object' ? linkConfig.onClick : undefined
            const target = typeof linkConfig === 'object' ? linkConfig.target : '_self'
            content = (
              <a
                onClick={(e) => {
                  e.stopPropagation()
                  if (onClick) onClick(record)
                  else onLinkClick?.(record, col.key as string)
                }}
                target={target}
                style={{ color: '#1890ff', cursor: 'pointer' }}
              >
                {text as string | number}
              </a>
            )
          }

          // 如果是开启拖拽时的第一列，在内容前面拼接拖拽手柄
          if (isFirstColumn && isDragSortable) {
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <DragHandle />
                {content}
              </div>
            )
          }

          return content
        },
      }
    })
  }, [filteredColumns, isDragSortable, onLinkClick])

  // 3. 拼接操作列
  const finalColumns = useMemo(() => {
    if (!actionColumn) return processedColumns

    const withoutAction = processedColumns.filter((col) => getColumnKey(col) !== 'action')
    const actionCol = {
      title: actionColumn.title || '操作',
      key: 'action',
      fixed: actionColumn.fixed || 'right',
      width: actionColumn.width || 180,
      render: (_: unknown, record: RecordType) => (
        <SmartTableButtons record={record} actionColumn={actionColumn} />
      ),
    }
    return [...withoutAction, actionCol]
  }, [processedColumns, actionColumn])

  return {
    checkedKeys,
    handleCheckedKeysChange,
    finalColumns,
  }
}

/** 跨页多选状态管理 Hook */
const useRowSelectionManager = <RecordType extends object>(
  rowKey: string | ((record: RecordType) => React.Key),
) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([])

  const clearSelection = useCallback(() => {
    setSelectedRowKeys([])
    setSelectedRows([])
  }, [])

  const getRowKey = useCallback(
    (record: RecordType): React.Key => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return (record as Record<string, unknown>)[rowKey] as React.Key
    },
    [rowKey],
  )

  const handleRowSelectionChange = useCallback(
    (keys: React.Key[], rows: RecordType[]) => {
      setSelectedRowKeys(keys)
      setSelectedRows((prevRows) => {
        const currentIds = rows.map((r) => getRowKey(r))
        const historyRows = prevRows.filter((r) => {
          const id = getRowKey(r)
          return keys.includes(id) && !currentIds.includes(id)
        })
        return [...historyRows, ...rows]
      })
    },
    [getRowKey],
  )

  return {
    selectedRowKeys,
    selectedRows,
    clearSelection,
    handleRowSelectionChange,
  }
}

// ==========================================
// 2. 主组件逻辑
// ==========================================

const SmartTableInner = <RecordType extends object>(
  props: SmartTableProps<RecordType>,
  ref: React.Ref<SmartTableInstance>,
) => {
  const {
    request,
    searchParams = {},
    pure = false,
    defaultSort = true,
    autoSearch = true,
    columns = [],
    storageKey,
    toolbar,
    schema = [],
    actionColumn,
    onLinkClick,
    showPagination = true,
    isDragSortable = false,
    handleOrderChange,
    treeConfig,
    ...restAntdProps
  } = props

  // 防错校验
  if (!pure && !request) {
    throw new Error('当 pure 为 false 时，request 必传！')
  }

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<RecordType[]>([])
  const [idNodeMap, setIdNodeMap] = useState<Map<string | number, RecordType> | undefined>()
  const [parentMap, setParentMap] = useState<Map<string | number, RecordType> | undefined>()
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })
  const [sorter, setSorter] = useState<SorterResult | SorterResult[]>({})

  // 用于比较 searchParams 是否发生深变更
  const prevSearchParamsRef = useRef(searchParams)

  // 计算表格主键
  const finalRowKey = (restAntdProps.rowKey as string | ((record: RecordType) => React.Key)) || 'id'

  // 使用拆分后的 Hooks
  const { checkedKeys, handleCheckedKeysChange, finalColumns } = useTableColumns({
    columns,
    storageKey,
    actionColumn,
    isDragSortable,
    onLinkClick,
  })

  const { selectedRowKeys, selectedRows, clearSelection, handleRowSelectionChange } =
    useRowSelectionManager(finalRowKey)

  // 数据请求的核心逻辑
  const loadData = useCallback(
    async (targetPagination = pagination, targetSorter = sorter, overrideParams = searchParams) => {
      if (pure || !request) return
      setLoading(true)
      try {
        const sortParams = defaultSort ? formatSortParams(targetSorter) : {}
        const formatDateFields = serializeFormValues(overrideParams, schema)
        const mergedParams = {
          page: targetPagination.page,
          pageSize: targetPagination.pageSize,
          ...formatDateFields,
          ...sortParams,
        }
        const res = await request(mergedParams, targetSorter)
        setDataSource(res?.data || [])
        setIdNodeMap(res?.idNodeMap)
        setParentMap(res?.parentMap)
        setTotal(res?.total || 0)
      } catch (error) {
        console.error('请求表格数据报错：', error)
      } finally {
        setLoading(false)
      }
    },
    [pure, request, defaultSort, schema, pagination, sorter, searchParams],
  )

  // 监听 searchParams 深对比，变动时重置页码
  useEffect(() => {
    if (!isEqual(prevSearchParamsRef.current, searchParams)) {
      prevSearchParamsRef.current = searchParams
      setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))
    }
  }, [searchParams])

  // 控制自动请求：当分页、排序或搜索条件发生改变时触发
  useEffect(() => {
    if (!autoSearch) return

    let isSubscribed = true

    const runSearch = async () => {
      if (isSubscribed) {
        await loadData(pagination, sorter, searchParams)
      }
    }

    void runSearch()

    return () => {
      isSubscribed = false
    }
  }, [pagination, sorter, searchParams, autoSearch, loadData])

  // 暴露给外部的 ref 方法
  useImperativeHandle(
    ref,
    () => ({
      refresh: (resetPage = false) => {
        if (resetPage) {
          setPagination((prev) => ({ ...prev, page: 1 }))
        } else {
          loadData(pagination, sorter, searchParams)
        }
      },
      clearSelection,
    }),
    [loadData, pagination, sorter, searchParams, clearSelection],
  )

  const handleTableChange: TableProps<RecordType>['onChange'] = (
    newPagination,
    _filters,
    newSorter,
  ) => {
    setPagination({
      page: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    })
    setSorter(newSorter)
  }

  function InnerTable() {
    const rawRowSelection = restAntdProps.rowSelection

    const computedRowSelection = useMemo(() => {
      if (!rawRowSelection) return undefined
      if (toolbar !== false) {
        return {
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: handleRowSelectionChange,
          ...rawRowSelection,
        }
      }
      return rawRowSelection
    }, [rawRowSelection])

    const commonProps: TableProps<RecordType> = {
      ...restAntdProps,
      columns: finalColumns,
      rowSelection: computedRowSelection,
    }
    if (pure) {
      return <Table {...commonProps} />
    } else {
      return (
        <Table
          rowKey={finalRowKey}
          loading={loading}
          dataSource={dataSource}
          columns={finalColumns}
          onChange={handleTableChange}
          pagination={
            showPagination
              ? {
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total,
                  showSizeChanger: true,
                  showTotal: (totalCount) => `共 ${totalCount} 条数据`,
                }
              : false
          }
          rowSelection={computedRowSelection}
          sticky={{
            offsetHeader: 0,
          }}
          {...commonProps}
        />
      )
    }
  }

  function renderFinalTable() {
    return isDragSortable ? (
      <SmartTableSortableWrapper
        idNodeMap={idNodeMap}
        parentMap={parentMap}
        treeConfig={treeConfig}
        setDataSource={setDataSource}
        onOrderChange={handleOrderChange}
      >
        {InnerTable()}
      </SmartTableSortableWrapper>
    ) : (
      InnerTable()
    )
  }

  // Pure 模式简易渲染
  if (pure) {
    return renderFinalTable()
  }

  return (
    <div>
      {toolbar !== false && (
        <SmartTableToolbar<RecordType>
          {...toolbar}
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          onClearSelection={clearSelection}
          rawColumns={columns}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={handleCheckedKeysChange}
          hideSettings={!storageKey || toolbar?.hideSettings}
        />
      )}
      {renderFinalTable()}
    </div>
  )
}

export const SmartTable = forwardRef(SmartTableInner) as <RecordType extends object>(
  props: SmartTableProps<RecordType> & { ref?: React.Ref<SmartTableInstance> },
) => React.ReactElement
