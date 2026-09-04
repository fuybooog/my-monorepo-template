import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { RedisService } from '@/utils/redis/redisService'
import { securityConfig } from './security.constants'

interface CounterPolicy {
  /** 失败计数 key */
  counterKey: string
  /** 计数窗口（秒）：窗口内未再失败则重新计数 */
  windowSeconds: number
  /** 触发锁定的失败次数 */
  maxFail: number
  /** 锁定 key */
  lockKey: string
  /** 锁定持续时间（秒） */
  lockSeconds: number
}

/**
 * 登录防爆破 / 防撞库。
 *
 * 两个独立维度，互为补充：
 * - 账号维度：连续失败 N 次锁定该账号，挡住针对单个账号的口令爆破；
 * - IP 维度：连续失败 M 次锁定来源 IP，挡住「多账号 × 单密码」的撞库。
 *
 * 计数与锁定状态都放 Redis（带 TTL），因此多实例部署下同样生效，且无需改动用户表。
 */
@Injectable()
export class LoginProtectionService {
  private readonly logger = new Logger(LoginProtectionService.name)

  private readonly USER_FAIL_PREFIX = 'auth:login:fail:user:'
  private readonly USER_LOCK_PREFIX = 'auth:login:lock:user:'
  private readonly IP_FAIL_PREFIX = 'auth:login:fail:ip:'
  private readonly IP_LOCK_PREFIX = 'auth:login:lock:ip:'

  constructor(private readonly redisService: RedisService) {}

  /** 登录前置校验：账号或来源 IP 处于锁定期内则直接拒绝 */
  async assertNotLocked(userName: string, clientIp: string): Promise<void> {
    await this.assertKeyNotLocked(
      `${this.USER_LOCK_PREFIX}${this.normalize(userName)}`,
      '账号因连续登录失败已被临时锁定',
    )

    if (clientIp) {
      await this.assertKeyNotLocked(
        `${this.IP_LOCK_PREFIX}${clientIp}`,
        '当前网络因连续登录失败已被临时锁定',
      )
    }
  }

  /** 记录一次登录失败，达到阈值后锁定 */
  async recordFailure(userName: string, clientIp: string): Promise<void> {
    const name = this.normalize(userName)

    await this.bump({
      counterKey: `${this.USER_FAIL_PREFIX}${name}`,
      windowSeconds: securityConfig.loginFailWindowSeconds,
      maxFail: securityConfig.loginMaxFail,
      lockKey: `${this.USER_LOCK_PREFIX}${name}`,
      lockSeconds: securityConfig.loginLockSeconds,
    })

    if (clientIp) {
      await this.bump({
        counterKey: `${this.IP_FAIL_PREFIX}${clientIp}`,
        windowSeconds: securityConfig.loginIpFailWindowSeconds,
        maxFail: securityConfig.loginIpMaxFail,
        lockKey: `${this.IP_LOCK_PREFIX}${clientIp}`,
        lockSeconds: securityConfig.loginIpLockSeconds,
      })
    }
  }

  /**
   * 登录成功后清空该账号的失败计数。
   * IP 计数刻意不清空，仅靠 TTL 自然衰减——否则攻击者只要成功登录一次就能重置撞库计数。
   */
  async clearUserFailures(userName: string): Promise<void> {
    await this.redisService.del(`${this.USER_FAIL_PREFIX}${this.normalize(userName)}`)
  }

  private async assertKeyNotLocked(lockKey: string, messagePrefix: string): Promise<void> {
    const ttl = await this.redisService.ttl(lockKey)
    if (ttl > 0) {
      throw new HttpException(
        `${messagePrefix}，请在 ${Math.ceil(ttl / 60)} 分钟后重试`,
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }
  }

  private async bump(policy: CounterPolicy): Promise<void> {
    const { counterKey, windowSeconds, maxFail, lockKey, lockSeconds } = policy

    const count = await this.redisService.incr(counterKey)
    // 首次计数时挂上过期时间，使计数在窗口结束后自动归零
    if (count === 1) {
      await this.redisService.expire(counterKey, windowSeconds)
    }

    if (count >= maxFail) {
      await this.redisService.set(lockKey, String(Date.now()), lockSeconds)
      await this.redisService.del(counterKey)
      this.logger.warn(`登录失败次数超限，已锁定 ${lockKey}（${lockSeconds}s）`)
    }
  }

  private normalize(userName: string): string {
    return (userName ?? '').trim().toLowerCase()
  }
}
