/// <reference types="vite/client" />

// 🌟 [改动 1]: 移除 CancelTokenSource，只需导入基础 Axios 类型
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const safeCleanParams = (obj: any) => {
  if (!obj || typeof obj !== 'object' || obj instanceof FormData) return obj

  const newObj: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    // 🌟 精准拦截：只剔除 null, undefined。空字符串，数字0 和布尔 false 必须安全保留！
    if (value !== null && value !== undefined) {
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
  type: 'http' | 'business' | 'timeout'
  status?: number
  errCode?: number
  errMsg?: string
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    _urlResolved?: boolean
    metaData?: RequestMetaData
    urlPrefix?: string
    cacheOptions?: {
      enable: boolean
      ttl?: number
    }
    mergeOptions?: {
      enable: boolean
    }
    debounceOptions?: {
      enable: boolean
      delay?: number
      accumulateKey?: string
    }
    autoCancelPrevious?: string
    onBusinessError?: (errMsg: string, errCode: number) => void
    onError?: (error: { head: { errCode: number; errMsg: string } }) => void
    autoCleanParams?: boolean
    mockError?: MockErrorConfig
  }
}

interface CachedRequest {
  data: any
  timestamp: number
  ttl: number
}

// 🌟 [改动 2]: 将 CancelTokenSource 替换为 AbortController
interface PendingRequest {
  promise: Promise<any>
  controller: AbortController
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

  private cacheMap = new Map<string, CachedRequest>()
  private pendingMap = new Map<string, PendingRequest>()
  private debounceMap = new Map<string, DebounceTask>()

  // 🌟 [改动 3]: 改用 Map 存储 AbortController
  private abortControllerMap = new Map<string, AbortController>()

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

    // 🌟 [改动 4]: 基于 AbortController 实现 autoCancelPrevious 与外部 signal 监听
    let currentController: AbortController | undefined

    if (config.autoCancelPrevious) {
      const cancelKey =
        typeof config.autoCancelPrevious === 'string'
          ? `cancel:group:${config.autoCancelPrevious}`
          : `cancel:${this.generateCacheKey(config)}`

      // 存在上一次未完成的请求则直接取消
      if (this.abortControllerMap.has(cancelKey)) {
        this.abortControllerMap.get(cancelKey)!.abort('Operation canceled due to new input.')
      }

      currentController = new AbortController()
      config.signal = currentController.signal
      this.abortControllerMap.set(cancelKey, currentController)
    } else if (!config.signal) {
      // 保证每一个请求都有对应的 controller，用于 pending 合并拦截的取消追踪
      currentController = new AbortController()
      config.signal = currentController.signal
    }

    // 若外部传入了 signal（如组件层传来的 signal），绑定协同取消逻辑
    if (config.signal && currentController && config.signal !== currentController.signal) {
      const externalSignal = config.signal
      if (externalSignal.aborted) {
        currentController.abort()
      } else {
        externalSignal!.addEventListener?.('abort', () => {
          currentController?.abort()
        })
      }
      config.signal = currentController.signal
    }

    if (config.debounceOptions?.enable) {
      return this.handleDebounce(config)
    }

    const cacheKey = this.generateCacheKey(config)

    // --- 🎯 1. 优先读取已完成的缓存 ---
    if (config.cacheOptions?.enable) {
      const cached = this.cacheMap.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return Promise.resolve(cached.data)
      }
    }

    // --- 🎯 2. 并发合并逻辑 ---
    const isCacheEnabled = !!config.cacheOptions?.enable
    const isMergeEnabled = !!config.mergeOptions?.enable

    if ((isCacheEnabled || isMergeEnabled) && this.pendingMap.has(cacheKey)) {
      console.log('🎯 [HttpClient] 成功拦截并发，合并请求:', cacheKey)
      return this.pendingMap.get(cacheKey)!.promise
    }

    // --- 🎯 3. 发起请求并存入 pendingMap ---
    const promise = this.instance(config)
      .then((response) => {
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
        this.cacheMap.delete(cacheKey)
        throw error
      })
      .finally(() => {
        this.pendingMap.delete(cacheKey)

        // 🌟 [改动 5]: 正确清理对应的 AbortController Map
        if (config.autoCancelPrevious) {
          const cancelKey =
            typeof config.autoCancelPrevious === 'string'
              ? `cancel:group:${config.autoCancelPrevious}`
              : `cancel:${this.generateCacheKey(config)}`
          this.abortControllerMap.delete(cancelKey)
        }
      })

    if ((isCacheEnabled || isMergeEnabled) && currentController) {
      this.pendingMap.set(cacheKey, { promise, controller: currentController })
    }

    return promise as Promise<T>
  }

  private resolveUrl(config: AxiosRequestConfig) {
    if (config._urlResolved) return

    if (config.url && /^https?:\/\//i.test(config.url)) {
      config.baseURL = ''
      config._urlResolved = true
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
    const accumulateKey = config.debounceOptions?.accumulateKey

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

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const isDev = import.meta.env.DEV

        if (isDev && config.mockError) {
          const { type, status = 500, errCode = 99999, errMsg = 'Mock 模拟错误' } = config.mockError

          if (type === 'timeout') {
            const timeoutError = new Error(`timeout of ${config.timeout || 10000}ms exceeded`)
            // @ts-expect-error - 扩展 Error 对象以附加 code 属性
            timeoutError.code = 'ECONNABORTED'
            timeoutError.cause = config
            return Promise.reject(timeoutError)
          }

          if (type === 'http') {
            const httpError = new Error(`Request failed with status code ${status}`)
            // @ts-expect-error - 扩展 Error 对象以附加 response 属性
            httpError.response = {
              status,
              statusText: 'Internal Server Error',
              data: { head: { errCode, errMsg } },
              headers: {},
              config,
            }
            return Promise.reject(httpError)
          }

          if (type === 'business') {
            const businessResponse = {
              status: 200,
              statusText: 'OK',
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
            return Promise.reject({ response: businessResponse })
          }
        }
        const method = config.method?.toLowerCase()
        config.metaData = { startTime: Date.now() }
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

  // 🌟 [改动 6]: 取消请求错误的准确识别与标准化
  private normalizeError(error: any) {
    let errCode = -1
    let errMsg

    if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.name === 'AbortError') {
      errCode = -999 // 指定专用的取消错误码，方便业务侧识别过滤
      errMsg = typeof error?.message === 'string' ? error.message : '请求已被取消'
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

  public clearCache(url?: string) {
    if (url) {
      for (const key of this.cacheMap.keys()) {
        if (key.includes(url)) this.cacheMap.delete(key)
      }
    } else {
      this.cacheMap.clear()
    }
  }

  public get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<T> {
    const mergedCacheOptions = {
      enable: true,
      ttl: 2000,
      ...config?.cacheOptions,
    }

    const finalConfig = {
      ...config,
      params,
      cacheOptions: mergedCacheOptions,
    }
    return this.request<T>({ ...finalConfig, url, params, method: 'GET' })
  }

  public delete<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, params, method: 'DELETE' })
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, data, method: 'POST' })
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, data, method: 'PUT' })
  }
}
