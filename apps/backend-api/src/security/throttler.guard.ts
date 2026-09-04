import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler'
import { resolveClientIp } from './client-ip'

/**
 * 全局限流守卫。
 *
 * 相对内置 ThrottlerGuard 的两点调整：
 * 1. 以客户端真实 IP 作为计数维度（内置实现直接取 req.ip，反向代理后会把所有用户算成同一个 Nginx）；
 * 2. 返回中文提示并带上可重试时间，便于前端直接展示。
 */
@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return resolveClientIp(req) || 'unknown'
  }

  protected async getErrorMessage(
    _context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const seconds = Math.max(1, Math.ceil(throttlerLimitDetail.ttl / 1000))
    return `操作过于频繁，请在 ${seconds} 秒后重试`
  }
}
