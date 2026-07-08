import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { Table, TableProps } from 'antd'
import { SmartTableInstance, SmartTableProps } from './smart-types'
import { SmartTableToolbar } from './SmartTableToolbar'
import { formatSortParams } from '@/utils'
import { getColumnKey } from './smart-utils'
import { SorterResult } from 'antd/es/table/interface'

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
    ...restAntdProps
  } = props

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<RecordType[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })
  const [sorter, setSorter] = useState<SorterResult | SorterResult[]>({})

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([])

  const [prevSearchParams, setPrevSearchParams] = useState(searchParams)

  if (prevSearchParams !== searchParams) {
    setPrevSearchParams(searchParams)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

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

  const currentColumns = useMemo(() => {
    return columns.filter((col) => {
      const key = getColumnKey(col)
      if (!key) return true
      return checkedKeys.includes(key)
    })
  }, [columns, checkedKeys])

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
        const mergedParams = {
          page: targetPagination.page,
          pageSize: targetPagination.pageSize,
          ...overrideParams,
          ...sortParams,
        }
        const res = await request(mergedParams, targetSorter)
        setDataSource(res?.data || [])
        setTotal(res?.total || 0)
      } catch (error) {
        console.log('请求表格数据报错：', error)
      } finally {
        setLoading(false)
      }
    },
    [pure, request, defaultSort, pagination, sorter, searchParams],
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
          columns={currentColumns}
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
