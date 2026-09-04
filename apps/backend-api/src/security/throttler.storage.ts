import { Injectable, Logger } from '@nestjs/common'
import type { ThrottlerStorage } from '@nestjs/throttler'

type ThrottlerStorageRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>

/** 内存计数超过该条数时触发一次过期清理，防止降级路径下无限增长 */
const MEMORY_GC_THRESHOLD = 10_000

/**
 * 带降级能力的限流存储。
 *
 * 限流属于「尽力而为」的防护，不应因为 Redis 抖动而把整个后端打挂——
 * 主存储（Redis）抛错时自动切到进程内计数，保证多实例部署时降级为单机限流而非全站 500。
 */
@Injectable()
export class ResilientThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(ResilientThrottlerStorage.name)
  private readonly memory = new Map<string, { hits: number; expiresAt: number }>()

  constructor(private readonly primary: ThrottlerStorage) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    try {
      return await this.primary.increment(key, ttl, limit, blockDuration, throttlerName)
    } catch (error) {
      this.logger.warn(`限流存储不可用，已降级为进程内计数：${(error as Error)?.message ?? error}`)
      return this.incrementInMemory(key, ttl, limit, blockDuration)
    }
  }

  private incrementInMemory(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    if (this.memory.size > MEMORY_GC_THRESHOLD) {
      this.gc()
    }

    const now = Date.now()
    const record = this.memory.get(key)
    // 无记录或已过期则重新计数，否则累加
    const hits = !record || record.expiresAt <= now ? 1 : record.hits + 1
    this.memory.set(key, { hits, expiresAt: now + ttl })

    return {
      totalHits: hits,
      timeToExpire: Math.ceil((this.memory.get(key)!.expiresAt - now) / 1000),
      isBlocked: hits > limit,
      timeToBlockExpire: Math.ceil(blockDuration / 1000),
    }
  }

  private gc(): void {
    const now = Date.now()
    for (const [key, record] of this.memory) {
      if (record.expiresAt <= now) {
        this.memory.delete(key)
      }
    }
  }
}
