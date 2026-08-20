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
  }) => Promise<{
    list: T[]
    total: number
  }>
  fetchByIdsApi?: (ids: (string | number)[] | string) => Promise<T[]>
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

  // 1. Refs 用于处理竞态、闭包和组件卸载状态
  const abortControllerRef = useRef<AbortController | null>(null)
  const echoLoadedIdsRef = useRef<Set<string | number>>(new Set()) // 已回显过的 ID 缓存
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // 组件卸载时取消未完成的请求
      abortControllerRef.current?.abort()
    }
  }, [])

  // 格式化函数
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

  // 2. 核心加载逻辑（防竞态 + 错误捕获 + 组件卸载安全）
  const loadData = useCallback(
    async (searchKey: string, pageNum: number, isAppend = false) => {
      // 取消上一次未完成的搜索请求，解决竞态问题
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
          // 追加数据时根据 value 严格去重，防止报错
          const existValues = new Set(prev.map((o) => o.value))
          const filteredNew = newOptions.filter((o) => !existValues.has(o.value))
          return [...prev, ...filteredNew]
        })

        setHasMore(pageNum * pageSize < (res?.total || 0))
      } catch (error: any) {
        // 如果是主动取消请求产生的 Error，不认为是业务错误
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

  // 3. 搜索防抖
  const handleSearch = useCallback(
    debounce((val: string) => {
      setKeyword(val)
      setPage(1)
      loadData(val, 1, false)
    }, debounceTimeout),
    [loadData, debounceTimeout],
  )

  // 4. 严谨的回显逻辑（去重缓存 + 容错）
  useEffect(() => {
    if (!value || !fetchByIdsApi) return
    const valueArray = (Array.isArray(value) ? value : [value]).filter(
      (v) => v !== undefined && v !== null,
    )

    // 筛选出既不在当前 options 里，也没被加载回显过的 ID
    const missingValues = valueArray.filter(
      (val) => !options.some((opt) => opt.value === val) && !echoLoadedIdsRef.current.has(val),
    )

    if (missingValues.length === 0) return

    // 记录已经准备加载的 ID，防止重复触发请求
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

  // 5. 下拉展开与触底翻页处理
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

  // 6. 异常与空状态渲染
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
