import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Select, Spin, Button, Empty, SelectProps } from 'antd'
import debounce from 'lodash-es/debounce'

export interface RemoteSelectOption {
  label: React.ReactNode
  value: string | number
  [key: string]: unknown
}

export interface RemoteSelectProps<T = Record<string, unknown>> extends Omit<
  SelectProps,
  'options' | 'onSearch' | 'fieldNames'
> {
  fetchApi: (params: {
    keyword: string
    page: number
    pageSize: number
    signal?: AbortSignal
    [key: string]: unknown
  }) => Promise<{
    list: T[]
    total: number
  }>
  fetchByIdsApi?: (ids: number[]) => Promise<T[]>
  fieldNames?: {
    label?: keyof T | ((item: T) => React.ReactNode)
    value?: keyof T
  }
  extraParams?: Record<string, unknown>
  pageSize?: number
  debounceTimeout?: number
}

export function RemoteSelect<T extends Record<string, unknown> = Record<string, unknown>>({
  value,
  onChange,
  fetchApi,
  fetchByIdsApi,
  fieldNames = { label: 'name' as keyof T, value: 'id' as keyof T },
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

  // 1. Refs 用于处理竞态、回显缓存和挂载状态
  const abortControllerRef = useRef<AbortController | null>(null)
  const echoLoadedIdsRef = useRef<Set<string | number>>(new Set())
  const isMountedRef = useRef(true)

  // 格式化 Option
  const formatOption = useCallback(
    (item: T): RemoteSelectOption => {
      const valKey = (fieldNames.value || 'id') as keyof T
      const val = item[valKey] as string | number

      const labelKey = (fieldNames.label || 'name') as keyof T
      const label =
        typeof fieldNames.label === 'function'
          ? fieldNames.label(item)
          : (item[labelKey] as React.ReactNode)

      return { ...item, label, value: val }
    },
    [fieldNames],
  )

  // 2. 核心加载逻辑
  const loadData = useCallback(
    async (searchKey: string, pageNum: number, isAppend = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setIsError(false)

      try {
        const res = await fetchApi({
          keyword: searchKey,
          page: pageNum,
          pageSize,
          ...extraParams,
          signal: abortControllerRef.current.signal,
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
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          (error.name === 'CanceledError' || error.name === 'AbortError')
        ) {
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

  // 3. 始终保存最新的 loadData 函数
  const loadDataRef = useRef(loadData)
  useEffect(() => {
    loadDataRef.current = loadData
  }, [loadData])

  // 4. 防抖执行逻辑（将 `.current` 的读取完全延迟到事件触发执行时，不在渲染期读取）
  const debouncedSearchRef = useRef<ReturnType<typeof debounce> | null>(null)

  useEffect(() => {
    debouncedSearchRef.current = debounce((val: string) => {
      loadDataRef.current(val, 1, false)
    }, debounceTimeout)

    return () => {
      debouncedSearchRef.current?.cancel()
    }
  }, [debounceTimeout])

  const handleSearch = useCallback((val: string) => {
    setKeyword(val)
    setPage(1)
    debouncedSearchRef.current?.(val)
  }, [])

  // 5. 组件卸载清理
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
      debouncedSearchRef.current?.cancel()
    }
  }, [])

  // 6. 严谨的回显逻辑
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
      .catch((err: unknown) => {
        console.error('[RemoteSelect] Echo fetch failed:', err)
      })
  }, [value, fetchByIdsApi, options, formatOption])

  // 7. 下拉展开与触底翻页处理
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

  // 8. 异常与空状态渲染
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
