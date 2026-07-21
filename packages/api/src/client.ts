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

export interface MockErrorConfig {
  /** 模拟的错误类型：'http' 代表网络/网关错误，'business' 代表业务代码错误，'timeout' 代表请求超时 */
  type: 'http' | 'business' | 'timeout'
  /** 模拟的 HTTP 状态码（如 500, 403, 502） */
  status?: number
  /** 模拟的业务错误码（如 10001） */
  errCode?: number
  /** 模拟的报错提示文案 */
  errMsg?: string
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
    // 自动取消上一次未完成的请求（通常用于输入搜索），值表示同一个取消组
    autoCancelPrevious?: string
    onBusinessError?: (errMsg: string, errCode: number) => void
    onError?: (error: { head: { errCode: number; errMsg: string } }) => void
    // 是否清除掉查询条件中值为''，null，undefined的字段，get请求下默认清除
    autoCleanParams?: boolean
    // 模拟错误
    mockError?: MockErrorConfig
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
      const cancelKey =
        typeof config.autoCancelPrevious === 'string'
          ? `cancel:group:${config.autoCancelPrevious}`
          : `cancel:${this.generateCacheKey(config)}`

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

    // --- 🎯 1. 优先读取【已完成】的内存数据缓存 ---
    if (config.cacheOptions?.enable) {
      const cached = this.cacheMap.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return Promise.resolve(cached.data)
      }
    }

    // --- 🎯 2. 核心修复：如果开启了缓存，或者开启了请求合并，且当前有正在进行的 Promise，直接返回它 ---
    const isCacheEnabled = !!config.cacheOptions?.enable
    const isMergeEnabled = !!config.mergeOptions?.enable

    if ((isCacheEnabled || isMergeEnabled) && this.pendingMap.has(cacheKey)) {
      console.log('🎯 [HttpClient] 成功拦截并发，合并请求:', cacheKey)
      return this.pendingMap.get(cacheKey)!.promise
    }

    const source = axios.CancelToken.source()
    config.cancelToken = config.cancelToken || source.token

    // --- 🎯 3. 一经发起，立即将 Promise 丢入 pendingMap 抢占位，完美阻击严格模式的瞬时双发 ---
    const promise = this.instance(config)
      .then((response) => {
        // 🚨 注意：由于你在响应拦截器里返回的是 serverData（即 response.data），这里的 response 已经是解析后的业务数据了

        // 如果开启了缓存，在成功时将数据写入 cacheMap
        if (isCacheEnabled) {
          this.cacheMap.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
            ttl: config.cacheOptions!.ttl || 5000,
          })
        }
        return response as unknown as T
      })
      .catch((error) => {
        // 异常时必须移除 pending，允许后续重试
        this.cacheMap.delete(cacheKey)
        throw error
      })
      .finally(() => {
        // 请求结束（无论成功失败），从正在请求的 map 中移除
        this.pendingMap.delete(cacheKey)

        if (config.autoCancelPrevious) {
          const cancelKey = `cancel:${config.method}:${config.url}`
          this.cancelSourceMap.delete(cancelKey)
        }
      })

    // 💡 立即占位，后面的并发请求直接享用这个成果
    if (isCacheEnabled || isMergeEnabled) {
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
        const isDev = import.meta.env.DEV

        if (isDev && config.mockError) {
          const { type, status = 500, errCode = 99999, errMsg = 'Mock 模拟错误' } = config.mockError

          // 🎯 场景 A：模拟超时的网络错误 (Timeout)
          if (type === 'timeout') {
            const timeoutError = new Error(`timeout of ${config.timeout || 10000}ms exceeded`)
            // @ts-expect-error - 扩展 Error 对象以附加 code 属性
            timeoutError.code = 'ECONNABORTED'
            timeoutError.cause = config
            return Promise.reject(timeoutError)
          }

          // 🎯 场景 B：模拟 HTTP 状态码错误 (如 500 / 403 / 502)
          if (type === 'http') {
            const httpError = new Error(`Request failed with status code ${status}`)
            // @ts-expect-error - 扩展 Error 对象以附加 response 属性，用于统一错误处理
            httpError.response = {
              status,
              statusText: 'Internal Server Error',
              data: { head: { errCode, errMsg } }, // 满足你的异常结构
              headers: {},
              config,
            }
            return Promise.reject(httpError)
          }

          // 🎯 场景 C：模拟纯业务错误（HTTP 状态 200，但业务 code 报错）
          if (type === 'business') {
            const businessResponse = {
              status: 200,
              statusText: 'OK',
              // 💡 这里的结构必须和你们后端的业务响应结构一模一样
              data: {
                head: {
                  errCode,
                  errMsg,
                },
                data: null,
              },
              headers: {},
              config,
            }
            // 直接把这个假成功的 response 塞进 reject 里，外层的响应拦截器会自动捕获并 normalize
            return Promise.reject({ response: businessResponse })
          }
        }
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
        return Promise.reject(normalized)
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
   * GET 请求：支持直接传参 默认开启2秒缓存
   * @param url 请求地址
   * @param params Query 参数对象，如 { a: 1, b: 2 }
   * @param config 额外的高级配置（缓存、防抖等），去除了 url, method 和 params
   */
  public get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<T> {
    const mergedCacheOptions = {
      enable: true, // 默认开启
      ttl: 2000, // 默认 2 秒
      ...config?.cacheOptions,
    }

    const finalConfig = {
      ...config,
      params,
      cacheOptions: mergedCacheOptions,
    }
    return this.request<T>({ ...finalConfig, url, params, method: 'GET' })
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
