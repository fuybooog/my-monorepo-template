// apps/backend-api/src/common/redis/redis.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

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
}
