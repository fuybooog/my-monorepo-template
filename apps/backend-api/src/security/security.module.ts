import { Global, Logger, Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { RedisService } from '@/utils/redis/redisService'
import { CsrfGuard } from './csrf.guard'
import { LoginProtectionService } from './login-protection.service'
import { securityConfig } from './security.constants'
import { ResilientThrottlerStorage } from './throttler.storage'

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => {
        const logger = new Logger('Throttler')

        // 多实例部署下限流计数需要共享，因此默认走 Redis；
        // 外层再用 ResilientThrottlerStorage 包一层，Redis 不可用时降级为进程内计数。
        const storage = new ResilientThrottlerStorage(
          new ThrottlerStorageRedisService(redisService.getClient()),
        )

        logger.log(
          `全局限流已启用：${securityConfig.throttleLimit} 次 / ${securityConfig.throttleTtl}ms（按客户端 IP 计数）`,
        )

        return {
          throttlers: [
            {
              name: 'default',
              ttl: securityConfig.throttleTtl,
              limit: securityConfig.throttleLimit,
            },
          ],
          storage,
        }
      },
    }),
  ],
  providers: [CsrfGuard, LoginProtectionService],
  // 重新导出 ThrottlerModule，使根模块注册 GlobalThrottlerGuard 时能解析到限流配置与存储
  exports: [ThrottlerModule, CsrfGuard, LoginProtectionService],
})
export class SecurityModule {}
