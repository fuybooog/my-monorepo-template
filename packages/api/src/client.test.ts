import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpClient } from './client'

/** 构造一个成功响应（走 response 拦截器的 head.errCode === 0 分支） */
const okResponse = (config: any) => ({
  data: { head: { errCode: 0, errMsg: 'ok' }, data: config },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

/**
 * 创建一个可记录调用、并支持取消信号（AbortError）的 mock adapter。
 * handler 返回最终响应内容。
 */
const createMockAdapter = (handler: (config: any) => any) => {
  const calls: any[] = []
  const adapter = (config: any) => {
    calls.push(config)
    return new Promise((resolve, reject) => {
      const signal = config.signal
      const onAbort = () => reject(Object.assign(new Error('canceled'), { name: 'AbortError' }))
      if (signal) {
        if (signal.aborted) {
          onAbort()
          return
        }
        signal.addEventListener('abort', onAbort)
      }
      Promise.resolve(handler(config)).then(resolve, reject)
    })
  }
  return { calls, adapter }
}

describe('HttpClient', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('URL 解析', () => {
    it('默认拼接 /api 前缀并设置 baseURL', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/value-set/page')
      expect(calls[0].url).toBe('/api/value-set/page')
      expect(calls[0].baseURL).toBe('https://api.test.com')
    })

    it('无前导斜杠的 url 也能正常拼接', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('value-set/page')
      expect(calls[0].url).toBe('/api/value-set/page')
    })

    it('支持自定义 urlPrefix', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.request({ url: '/x', method: 'GET', urlPrefix: '/v2' } as any)
      expect(calls[0].url).toBe('/v2/x')
    })

    it('绝对 URL 不拼接前缀且清空 baseURL', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.request({ url: 'https://cdn.com/a.png', method: 'GET' } as any)
      expect(calls[0].url).toBe('https://cdn.com/a.png')
      expect(calls[0].baseURL).toBe('')
    })
  })

  describe('参数清洗', () => {
    it('GET 请求剔除 null/undefined，保留 0、false、空字符串', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/x', { a: null, b: undefined, c: 0, d: false, e: '' })
      expect(calls[0].params).toEqual({ c: 0, d: false, e: '' })
    })

    it('可通过 autoCleanParams: false 关闭清洗', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/x', { a: null }, { autoCleanParams: false } as any)
      expect(calls[0].params).toEqual({ a: null })
    })
  })

  describe('认证头', () => {
    it('本地存在 token 时注入 Authorization', async () => {
      localStorage.setItem('token', 'abc123')
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/x', {}, { cacheOptions: { enable: false } } as any)
      const headers: any = calls[0].headers
      const auth = headers?.get ? headers.get('Authorization') : headers?.['Authorization']
      expect(auth).toBe('Bearer abc123')
    })
  })

  describe('缓存', () => {
    it('GET 默认缓存：相同请求只发一次，clearCache 后重新请求', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/cache')
      await client.get('/cache')
      expect(calls).toHaveLength(1)

      client.clearCache()
      await client.get('/cache')
      expect(calls).toHaveLength(2)
    })

    it('缓存 key 区分 params', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/cache', { a: 1 })
      await client.get('/cache', { a: 2 })
      expect(calls).toHaveLength(2)
    })

    it('缓存 TTL 过期后重新请求', async () => {
      vi.useFakeTimers()
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await client.get('/ttl', {}, { cacheOptions: { enable: true, ttl: 100 } } as any)
      await vi.advanceTimersByTimeAsync(150)
      await client.get('/ttl', {}, { cacheOptions: { enable: true, ttl: 100 } } as any)
      expect(calls).toHaveLength(2)
    })
  })

  describe('并发合并', () => {
    it('并发相同请求只发一次', async () => {
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      const [r1, r2] = await Promise.all([
        client.get('/merge', { a: 1 }),
        client.get('/merge', { a: 1 }),
      ])
      expect(calls).toHaveLength(1)
      expect(r1).toEqual(r2)
    })
  })

  describe('取消请求', () => {
    it('autoCancelPrevious：取消同一分组的上一次请求', async () => {
      const adapter = (config: any) =>
        new Promise((resolve, reject) => {
          const onAbort = () => reject(Object.assign(new Error('canceled'), { name: 'AbortError' }))
          config.signal?.addEventListener('abort', onAbort)
          if (config.url === '/api/fast') {
            resolve(okResponse(config))
          }
          // /api/slow 保持 pending，等待被取消
        })
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })

      const slow = client.get('/slow', {}, {
        autoCancelPrevious: 'g1',
        cacheOptions: { enable: false },
      } as any)
      const fast = client.get('/fast', {}, {
        autoCancelPrevious: 'g1',
        cacheOptions: { enable: false },
      } as any)

      await expect(fast).resolves.toBeTruthy()
      await expect(slow).rejects.toMatchObject({ head: { errCode: -999 } })
    })

    it('外部 signal 已中止时请求被取消', async () => {
      const controller = new AbortController()
      controller.abort()
      const { adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })
      await expect(
        client.get('/x', {}, { signal: controller.signal, cacheOptions: { enable: false } } as any),
      ).rejects.toMatchObject({ head: { errCode: -999 } })
    })
  })

  describe('防抖', () => {
    it('合并短时间内的多次请求，并注入 accumulateKey', async () => {
      vi.useFakeTimers()
      const { calls, adapter } = createMockAdapter(okResponse)
      const client = new HttpClient({ baseURL: 'https://api.test.com', adapter: adapter as any })

      const p1 = client.get('/debounce', { kw: 'a' }, {
        debounceOptions: { enable: true, delay: 300, accumulateKey: 'count' },
        cacheOptions: { enable: false },
      } as any)
      const p2 = client.get('/debounce', { kw: 'b' }, {
        debounceOptions: { enable: true, delay: 300, accumulateKey: 'count' },
        cacheOptions: { enable: false },
      } as any)

      await vi.advanceTimersByTimeAsync(400)

      const [r1, r2] = await Promise.all([p1, p2])
      expect(calls).toHaveLength(1)
      expect(calls[0].params).toEqual({ kw: 'b', count: 2 })
      expect(r1).toEqual(r2)
    })
  })

  describe('错误处理', () => {
    it('业务错误：触发 onBusinessError 并 reject 标准化错误', async () => {
      const onBusinessError = vi.fn()
      const client = new HttpClient({ baseURL: 'https://api.test.com', onBusinessError })

      await expect(
        client.get('/biz', {}, {
          mockError: { type: 'business', errCode: 5001, errMsg: '业务失败' },
          cacheOptions: { enable: false },
        } as any),
      ).rejects.toMatchObject({ head: { errCode: 5001, errMsg: '业务失败' } })
      expect(onBusinessError).toHaveBeenCalledWith('业务失败', 5001)
    })

    it('HTTP 错误：触发 onError 并标准化 errCode', async () => {
      const onError = vi.fn()
      const client = new HttpClient({ baseURL: 'https://api.test.com', onError })

      await expect(
        client.get('/http', {}, {
          mockError: { type: 'http', status: 500, errCode: 500, errMsg: '服务器错误' },
          cacheOptions: { enable: false },
        } as any),
      ).rejects.toMatchObject({ head: { errCode: 500, errMsg: '服务器错误' } })
      expect(onError).toHaveBeenCalled()
    })

    it('超时错误：errCode 为 -1', async () => {
      const client = new HttpClient({ baseURL: 'https://api.test.com' })
      await expect(
        client.get('/timeout', {}, {
          mockError: { type: 'timeout' },
          cacheOptions: { enable: false },
        } as any),
      ).rejects.toMatchObject({ head: { errCode: -1 } })
    })
  })
})
