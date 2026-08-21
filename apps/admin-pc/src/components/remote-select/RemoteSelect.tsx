import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Select, Spin, Button, Empty, SelectProps } from 'antd'
import debounce from 'lodash-es/debounce'

export interface RemoteSelectOption {
  label: React.ReactNode
  value: string | number
  [key: string]: any
}

export interface RemoteSelectProps<T = any> extends Omit<
  SelectProps,
  'options' | 'onSearch' | 'fieldNames'
> {
  fetchApi: (params: {
    keyword: string
    page: number
    pageSize: number
    [key: string]: any
  }) => Promise<{ list: T[]; total: number }>
  fetchByIdsApi?: (ids: (string | number)[]) => Promise<T[]>
  fieldNames?: {
    label?: string | ((item: T) => React.ReactNode)
    value?: string
  }
  extraParams?: Record<string, any>
  pageSize?: number
  debounceTimeout?: number
}

export function RemoteSelect<T = any>({
  value,
  onChange,
  fetchApi,
  fetchByIdsApi,
  fieldNames = { label: 'name', value: 'id' },
  extraParams = {},
  pageSize = 20,
  debounceTimeout = 300,
  placeholder = '请输入关键字搜索',
  ...restProps
}: RemoteSelectProps<T>) {
  const [options, setOptions] = useState<RemoteSelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const echoLoadedIdsRef = useRef<Set<string | number>>(new Set())
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const formatOption = useCallback(
    (item: T): RemoteSelectOption => {
      const val = (item as any)[fieldNames.value || 'id']
      const label =
        typeof fieldNames.label === 'function'
          ? fieldNames.label(item)
          : (item as any)[fieldNames.label || 'name']
      return { ...item, label, value: val }
    },
    [fieldNames],
  )

  const loadData = useCallback(
    async (searchKey: string, pageNum: number, isAppend = false) => {
      setLoading(true)
      setIsError(false)

      try {
        const res = await fetchApi({
          keyword: searchKey,
          page: pageNum,
          pageSize,
          ...extraParams,
        })

        if (!isMountedRef.current) return

        const newOptions = (res?.list || []).map(formatOption)

        setOptions((prev) => {
          if (!isAppend) return newOptions
          const existValues = new Set(prev.map((o) => o.value))
          const filteredNew = newOptions.filter((o) => !existValues.has(o.value))
          return [...prev, ...filteredNew]
        })

        setHasMore(pageNum * pageSize < (res?.total || 0))
      } catch (error: any) {
        if (error?.name === 'CanceledError' || error?.name === 'AbortError') {
          return
        }
        if (isMountedRef.current) {
          setIsError(true)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    },
    [fetchApi, extraParams, pageSize, formatOption],
  )

  // 同步最新 loadData 到 ref
  const loadDataRef = useRef(loadData)
  useEffect(() => {
    loadDataRef.current = loadData
  }, [loadData])

  // 防抖函数修复
  type DebouncedSearch = ((val: string) => void) & { cancel?: () => void }
  const debouncedSearchRef = useRef<DebouncedSearch | null>(null)

  useEffect(() => {
    debouncedSearchRef.current = debounce((val: string) => {
      setKeyword(val)
      setPage(1)
      loadDataRef.current(val, 1, false)
    }, debounceTimeout)

    return () => {
      debouncedSearchRef.current?.cancel?.()
    }
  }, [debounceTimeout])

  const handleSearch = useCallback((val: string) => {
    debouncedSearchRef.current?.(val)
  }, [])

  // 首次挂载触发一次空搜索
  useEffect(() => {
    handleSearch('')
  }, [handleSearch])

  // 回显逻辑保持不变
  useEffect(() => {
    if (!value || !fetchByIdsApi) return
    const valueArray = (Array.isArray(value) ? value : [value]).filter(
      (v) => v !== undefined && v !== null,
    )

    const missingValues = valueArray.filter(
      (val) => !options.some((opt) => opt.value === val) && !echoLoadedIdsRef.current.has(val),
    )

    if (missingValues.length === 0) return

    missingValues.forEach((id) => echoLoadedIdsRef.current.add(id))

    fetchByIdsApi(missingValues)
      .then((items) => {
        if (!isMountedRef.current || !items) return
        const missingOptions = items.map(formatOption)
        setOptions((prev) => {
          const existValues = new Set(prev.map((o) => o.value))
          const uniqueNew = missingOptions.filter((o) => !existValues.has(o.value))
          return [...uniqueNew, ...prev]
        })
      })
      .catch((err) => {
        console.error('[RemoteSelect] Echo fetch failed:', err)
      })
  }, [value, fetchByIdsApi, options, formatOption])

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open && options.length === 0 && !loading && !isError) {
      loadData('', 1, false)
    }
  }

  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 15 && hasMore && !loading && !isError) {
      const nextPage = page + 1
      setPage(nextPage)
      loadData(keyword, nextPage, true)
    }
  }

  const renderNotFound = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Spin size="small" />
        </div>
      )
    }
    if (isError) {
      return (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <span style={{ color: '#ff4d4f', marginRight: 8 }}>加载失败</span>
          <Button type="link" size="small" onClick={() => loadData(keyword, page, page > 1)}>
            重试
          </Button>
        </div>
      )
    }
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  }

  return (
    <Select
      showSearch={{
        filterOption: false,
        onSearch: handleSearch,
      }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onPopupScroll={handlePopupScroll}
      notFoundContent={renderNotFound()}
      options={options}
      onOpenChange={handleDropdownVisibleChange}
      allowClear
      style={{ width: '100%' }}
      {...restProps}
    />
  )
}

RemoteSelect.displayName = 'RemoteSelect'
