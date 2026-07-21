import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { Table, TableProps } from 'antd'
import { SmartTableInstance, SmartTableProps } from './smart-types'
import { SmartTableToolbar } from './SmartTableToolbar'
import { formatSortParams } from '@/utils'
import { getColumnKey, serializeFormValues } from './smart-utils'
import { SorterResult } from 'antd/es/table/interface'
import { isEqual } from 'lodash'
import { SmartTableButtons } from './SmartTableButtons'

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
    ...restAntdProps
  } = props

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<RecordType[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })
  const [sorter, setSorter] = useState<SorterResult | SorterResult[]>({})

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([])

  // const [prevSearchParams, setPrevSearchParams] = useState(searchParams)
  const prevSearchParamsRef = useRef(searchParams)

  // const paramsChanged = useMemo(() => {
  //   // return JSON.stringify(prevSearchParamsRef.current) !== JSON.stringify(searchParams)
  //   return !isEqual(prevSearchParamsRef.current, searchParams)
  // }, [searchParams])

  const searchParamsRef = useRef(searchParams)
  const paginationRef = useRef(pagination)
  const sorterRef = useRef(sorter)

  // 当查询条件变动时，强制从第一页开始查询
  useEffect(() => {
    if (!isEqual(prevSearchParamsRef.current, searchParams)) {
      prevSearchParamsRef.current = searchParams
      setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))
    }
  }, [searchParams])

  useEffect(() => {
    searchParamsRef.current = searchParams
  }, [searchParams])
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])
  useEffect(() => {
    sorterRef.current = sorter
  }, [sorter])

  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(() => {
    const allKeys = columns.map((col) => getColumnKey(col)).filter(Boolean) as React.Key[]
    if (storageKey) {
      const localValue = localStorage.getItem(`table_cols_${storageKey}`)
      if (localValue) {
        try {
          return JSON.parse(localValue) as React.Key[]
        } catch (e) {
          console.error('获取local数据报错', e)
        }
      }
    }
    return allKeys
  })
  // 1. 过滤列（保留用户勾选的列）
  const filteredColumns = useMemo(() => {
    return columns.filter((col) => {
      const key = getColumnKey(col)
      if (!key) return true
      return checkedKeys.includes(key)
    })
  }, [columns, checkedKeys])

  // 在 finalColumns 之前或内部处理
  const processedColumns = useMemo(() => {
    return filteredColumns.map((col) => {
      const linkConfig = col.link
      if (!linkConfig) return col

      // 如果列已有 render，则不自动包裹链接（避免覆盖）
      if (col.render) return col

      const onClick = typeof linkConfig === 'object' ? linkConfig.onClick : undefined
      const target = typeof linkConfig === 'object' ? linkConfig.target : '_self'

      return {
        ...col,
        render: (text: string, record: RecordType) => (
          <a
            onClick={(e) => {
              e.stopPropagation() // 阻止行选中事件
              if (onClick) onClick(record)
              else onLinkClick?.(record, col.key as string)
            }}
            target={target}
            style={{ color: '#1890ff', cursor: 'pointer' }}
          >
            {text}
          </a>
        ),
      }
    })
  }, [filteredColumns, onLinkClick])

  // 2. 追加操作列（如果有）
  const finalColumns = useMemo(() => {
    if (!actionColumn) return processedColumns

    // 移除外部可能已经添加的操作列（避免重复）
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

  const handleCheckedKeysChange = (nextKeys: React.Key[]) => {
    setCheckedKeys(nextKeys)
    if (storageKey) {
      localStorage.setItem(`table_cols_${storageKey}`, JSON.stringify(nextKeys))
    }
  }

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
        setTotal(res?.total || 0)
      } catch (error) {
        console.error('请求表格数据报错：', error)
      } finally {
        setLoading(false)
      }
    },
    [pure, request, defaultSort, schema],
  )

  useEffect(() => {
    if (!autoSearch) {
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(pagination, sorter, searchParams)
  }, [pagination, sorter, searchParams, autoSearch, loadData])

  const clearSelection = () => {
    setSelectedRowKeys([])
    setSelectedRows([])
  }

  useImperativeHandle(ref, () => ({
    refresh: (resetPage = false) => {
      if (resetPage) {
        setPagination((prev) => ({ ...prev, page: 1 }))
      } else {
        loadData(pagination, sorter, searchParams)
      }
    },
    clearSelection,
  }))

  const handleTableChange: TableProps<RecordType>['onChange'] = (
    newPagination,
    filters,
    newSorter,
  ) => {
    setPagination({
      page: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    })
    setSorter(newSorter)
  }

  if (!pure && !request) throw new Error('当 pure 为 false 时，request 必传！')

  const finalRowKey = (restAntdProps.rowKey as string | ((record: RecordType) => React.Key)) || 'id'

  return (
    <div>
      {toolbar !== false && (
        <SmartTableToolbar<RecordType>
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          onClearSelection={clearSelection}
          rawColumns={columns}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={handleCheckedKeysChange}
          actions={toolbar?.actions}
          hideSettings={toolbar?.hideSettings}
          onCreate={toolbar?.onCreate}
          onBatchDelete={toolbar?.onBatchDelete}
        />
      )}
      {pure ? (
        <Table columns={columns} {...restAntdProps} />
      ) : (
        <Table
          rowKey={finalRowKey}
          loading={loading}
          dataSource={dataSource}
          columns={finalColumns}
          onChange={handleTableChange}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (totalCount) => `共 ${totalCount} 条数据`,
          }}
          rowSelection={
            toolbar !== false
              ? {
                  selectedRowKeys,
                  preserveSelectedRowKeys: true,
                  onChange: (keys, rows) => {
                    setSelectedRowKeys(keys)
                    setSelectedRows((prevRows) => {
                      const getRowKey = (record: RecordType): React.Key => {
                        if (typeof finalRowKey === 'function') {
                          return finalRowKey(record)
                        }

                        const obj = record as Record<string, unknown>
                        return obj[finalRowKey] as React.Key
                      }

                      const currentIds = rows.map((r) => getRowKey(r))

                      const historyRows = prevRows.filter((r) => {
                        const id = getRowKey(r)
                        return keys.includes(id) && !currentIds.includes(id)
                      })
                      return [...historyRows, ...rows]
                    })
                  },
                  ...restAntdProps.rowSelection,
                }
              : restAntdProps.rowSelection
          }
          {...restAntdProps}
        />
      )}
    </div>
  )
}

export const SmartTable = forwardRef(SmartTableInner) as <RecordType extends object>(
  props: SmartTableProps<RecordType> & { ref?: React.Ref<SmartTableInstance> },
) => React.ReactElement
