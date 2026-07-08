/// <reference types="vite/client" />

import axios, { type AxiosInstance, type AxiosRequestConfig, type CancelTokenSource } from 'axios'

const safeCleanParams = (obj: any) => {
  if (!obj || typeof obj !== 'object' || obj instanceof FormData) return obj

  const newObj: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    // 🌟 精准拦截：只剔除 null, undefined 和空字符串。数字 0 和布尔 false 必须安全保留！
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      newObj[key] = value
    }
  })
  return newObj
}

// --- 1. 类型定义扩展 ---

export interface RequestMetaData {
  startTime: number
}

// 扩展 AxiosRequestConfig，支持业务控制参数
declare module 'axios' {
  export interface AxiosRequestConfig {
    // url会被默认处理
    _urlResolved?: boolean
    metaData?: RequestMetaData
    urlPrefix?: string
    // 请求缓存配置
    cacheOptions?: {
      enable: boolean
      ttl?: number // 毫秒
    }
    mergeOptions?: {
      enable: boolean
    }
    // 防抖配置
    debounceOptions?: {
      enable: boolean
      delay?: number // 经典的防抖（Debounce）合并：只有当用户「停止操作」并满指定 delay 后，才会触发网络同步
      accumulateKey?: string // 累计次数需要映射到 body 或 params 的字段名
    }
    // 自动取消上一次未完成的请求（通常用于输入搜索）
    autoCancelPrevious?: boolean
    onBusinessError?: (errMsg: string, errCode: number) => void
    onError?: (error: { head: { errCode: number; errMsg: string } }) => void
    // 是否清除掉查询条件中值为''，null，undefined的字段，get请求下默认清除
    autoCleanParams?: boolean
  }
}

interface CachedRequest {
  data: any
  timestamp: number
  ttl: number
}

interface PendingRequest {
  promise: Promise<any>
  cancelSource: CancelTokenSource
}

interface DebounceTask {
  timer: number
  count: number
  config: AxiosRequestConfig
  listeners: Array<{
    resolve: (value: any) => void
    reject: (reason: any) => void
  }>
}

export class HttpClient {
  private instance: AxiosInstance
  private options: AxiosRequestConfig

  // 状态存储
  private cacheMap = new Map<string, CachedRequest>()
  private pendingMap = new Map<string, PendingRequest>()
  private debounceMap = new Map<string, DebounceTask>()
  private cancelSourceMap = new Map<string, CancelTokenSource>() // 用于输入搜索的自动取消

  constructor(options: AxiosRequestConfig) {
    this.options = options
    this.instance = axios.create({
      ...options,
    })
    this.setupInterceptors()
  }

  // --- 核心请求方法封装 ---
  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    this.resolveUrl(config)

    if (config.autoCancelPrevious) {
      const cancelKey = `cancel:${config.method}:${config.url}`
      if (this.cancelSourceMap.has(cancelKey)) {
        this.cancelSourceMap.get(cancelKey)!.cancel('Operation canceled due to new input.')
      }
      const source = axios.CancelToken.source()
      config.cancelToken = source.token
      this.cancelSourceMap.set(cancelKey, source)
    }

    if (config.debounceOptions?.enable) {
      return this.handleDebounce(config)
    }

    const cacheKey = this.generateCacheKey(config)

    // --- 优先读取内存缓存 ---
    if (config.cacheOptions?.enable) {
      const cached = this.cacheMap.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return Promise.resolve(cached.data)
      }
    }

    if (config.mergeOptions?.enable && this.pendingMap.has(cacheKey)) {
      return this.pendingMap.get(cacheKey)!.promise
    }

    const source = axios.CancelToken.source()
    config.cancelToken = config.cancelToken || source.token

    const promise = this.instance(config)
      .then((response) => {
        if (config.cacheOptions?.enable) {
          this.cacheMap.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
            ttl: config.cacheOptions.ttl || 5000,
          })
        }
        return response as unknown as T
      })
      .catch((error) => {
        this.pendingMap.delete(cacheKey)
        return Promise.reject(error)
      })
      .finally(() => {
        this.pendingMap.delete(cacheKey)

        if (config.autoCancelPrevious) {
          const cancelKey = `cancel:${config.method}:${config.url}`
          this.cancelSourceMap.delete(cancelKey)
        }
      })

    if (config.mergeOptions?.enable) {
      this.pendingMap.set(cacheKey, { promise, cancelSource: source })
    }

    return promise as Promise<T>
  }

  // --- 核心功能扩展实现 ---

  /**
   * 1. 模块化服务路由解析
   */
  private resolveUrl(config: AxiosRequestConfig) {
    if (config._urlResolved) return

    if (config.url && /^https?:\/\//i.test(config.url)) {
      config.baseURL = ''
      config._urlResolved = true // 标记已处理
      return
    }

    config.baseURL = this.options.baseURL

    if (config.url) {
      const prefix = config.urlPrefix !== undefined ? config.urlPrefix : '/api'
      if (prefix) {
        const cleanUrl = config.url.replace(/^\//, '')
        const cleanPrefix = `/${prefix.replace(/^\/|\/$/, '')}`

        config.url = `${cleanPrefix}/${cleanUrl}`
      }
    }

    config._urlResolved = true
  }

  private handleDebounce(config: AxiosRequestConfig): Promise<any> {
    const method = config.method?.toLowerCase() || 'get'
    const key = `debounce:${method}:${config.url}`
    const delay = config.debounceOptions?.delay || 300
    const accumulateKey = config.debounceOptions?.accumulateKey // 获取累加键名

    return new Promise((resolve, reject) => {
      const existingTask = this.debounceMap.get(key)

      if (existingTask) {
        clearTimeout(existingTask.timer)

        existingTask.count += 1

        existingTask.config = {
          ...config,
          params: config.params ? { ...config.params } : undefined,
          data: config.data ? { ...config.data } : undefined,
        }

        existingTask.listeners.push({ resolve, reject })
      } else {
        this.debounceMap.set(key, {
          timer: null as any,
          count: 1,
          config: {
            ...config,
            params: config.params ? { ...config.params } : undefined,
            data: config.data ? { ...config.data } : undefined,
          },
          listeners: [{ resolve, reject }],
        })
      }

      const task = this.debounceMap.get(key)!

      task.timer = setTimeout(async () => {
        this.debounceMap.delete(key)

        try {
          if (accumulateKey) {
            if (method === 'get' || method === 'delete') {
              task.config.params = {
                ...task.config.params,
                [accumulateKey]: task.count,
              }
            } else {
              task.config.data = {
                ...task.config.data,
                [accumulateKey]: task.count,
              }
            }
          }

          const finalConfig = { ...task.config, debounceOptions: { enable: false } }
          const res = await this.request(finalConfig)

          task.listeners.forEach((listener) => listener.resolve(res))
        } catch (error) {
          task.listeners.forEach((listener) => listener.reject(error))
        }
      }, delay)
    })
  }

  private handleBusinessError(serverData: any, response: any) {
    const errMsg = serverData.head.errMsg || '业务操作失败'
    const errCode = serverData.head.errCode
    if (this.options.onBusinessError) {
      this.options.onBusinessError(errMsg, errCode)
    }
  }

  /**
   * 6. 统一拦截器 (Headers 与错误格式化)
   */
  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const method = config.method?.toLowerCase()
        config.metaData = { startTime: Date.now() }
        // 策略 A: GET 请求（通常是列表查询）默认开启清洗，除非显式传入 autoCleanParams: false
        // 策略 B: POST/PUT 等修改请求默认不清洗（防误杀清空操作），除非显式传入 autoCleanParams: true
        const shouldClean =
          config.autoCleanParams !== undefined ? config.autoCleanParams : method === 'get'

        if (shouldClean) {
          if (method === 'get' && config.params) {
            config.params = safeCleanParams(config.params)
          } else if (config.data) {
            config.data = safeCleanParams(config.data)
          }
        }
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(this.normalizeError(error)),
    )

    this.instance.interceptors.response.use(
      async (response) => {
        if (response.data instanceof Blob || response.data instanceof ArrayBuffer) {
          if (response.data instanceof Blob && response.data.type.includes('application/json')) {
            const text = await response.data.text()
            const serverData = JSON.parse(text)
            this.handleBusinessError(serverData, response)
            return serverData
          }
          return response
        }

        const serverData = response.data
        if (!serverData || !serverData.head) {
          return serverData
        }

        if (serverData.head.errCode !== 0) {
          this.handleBusinessError(serverData, response)
          return serverData
        }

        return serverData
      },
      (error) => {
        const normalized = this.normalizeError(error)
        if (normalized && normalized.head && normalized.head.errCode !== 0) {
          this.handleBusinessError(normalized, error.response)
        }
        if (this.options.onError) {
          this.options.onError(normalized)
        }
        return Promise.resolve(normalized)
      },
    )
  }

  /**
   * 6. 统一错误格式化
   */
  private normalizeError(error: any) {
    let errCode = -1
    let errMsg

    if (axios.isCancel(error)) {
      errMsg = '请求已被取消'
    } else if (error.response) {
      const serverBody = error.response.data

      if (serverBody && serverBody.head) {
        errCode = serverBody.head.errCode ?? error.response.status
        errMsg = serverBody.head.errMsg || '业务操作失败'
      } else {
        errCode = error.response.status
        errMsg = serverBody?.message || error.message || `服务器开小差了 [${errCode}]`
      }

      if (errCode === 401 || errCode === -2) {
        localStorage.removeItem('token')
      }
    } else if (error.request) {
      errMsg = '无法连接到服务器，请检查网络设置'
    } else {
      errMsg = error.message || '初始化请求失败'
    }

    const fakeStandardResponse = {
      head: {
        errCode: errCode,
        errMsg: errMsg,
      },
      data: null,
      raw: error,
    }

    return fakeStandardResponse
  }

  /**
   * 工具方法：精确生成缓存/合并 Key
   */
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    const sortedParams = params
      ? JSON.stringify(
          Object.keys(params)
            .sort()
            .reduce((r, k) => ({ ...r, [k]: params[k] }), {}),
        )
      : ''
    const sortedData = data ? JSON.stringify(data) : ''
    return `${method?.toLowerCase()}:${url}:${sortedParams}:${sortedData}`
  }

  /**
   * 3. 手动清除缓存 API
   */
  public clearCache(url?: string) {
    if (url) {
      for (const key of this.cacheMap.keys()) {
        if (key.includes(url)) this.cacheMap.delete(key)
      }
    } else {
      this.cacheMap.clear()
    }
  }
  /**
   * GET 请求：支持直接传参
   * @param url 请求地址
   * @param params Query 参数对象，如 { a: 1, b: 2 }
   * @param config 额外的高级配置（缓存、防抖等），去除了 url, method 和 params
   */
  public get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, params, method: 'GET' })
  }

  /**
   * DELETE 请求：通常也携带 Query 参数，同步对齐体验
   */
  public delete<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, params, method: 'DELETE' })
  }

  /**
   * POST 请求：保持原样 (url, data, config)
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, data, method: 'POST' })
  }

  /**
   * PUT 请求：保持原样 (url, data, config)
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, data, method: 'PUT' })
  }
}
