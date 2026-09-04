import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  /** 暴露底层 ioredis 实例，供限流存储等基础设施复用（业务代码请勿直接使用） */
  getClient(): Redis {
    return this.client
  }

  // 封装常用的统一方法，加入全局通用前缀或日志监控
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl)
    }
    return this.client.set(key, value)
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds)
  }

  /** 剩余过期时间（秒）：-2 表示 key 不存在，-1 表示未设置过期时间 */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  // GETDEL 语义：原子取出并删除一个 key（兼容任意 Redis 版本，无需 6.2+）
  // 并发下仅第一个调用能取到旧值，用于 refresh token 轮换消费/防重放
  async getdel(key: string): Promise<string | null> {
    const script = `
      local value = redis.call('GET', KEYS[1])
      if value then
        redis.call('DEL', KEYS[1])
      end
      return value
    `
    return (await this.client.eval(script, 1, key)) as string | null
  }
}
