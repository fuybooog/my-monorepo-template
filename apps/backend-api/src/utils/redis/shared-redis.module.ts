import { Module, Global, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisModule } from '@nestjs-modules/ioredis'
import { RedisService } from '@/utils/redis/redisService'

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisConnection')

        return {
          type: 'single',
          url: `redis://${configService.get('REDIS_HOST', '127.0.0.1')}:${configService.get('REDIS_PORT', 6379)}`,
          options: {
            password: configService.get<string>('REDIS_PASSWORD'),
            db: configService.get<number>('REDIS_DB', 0),

            retryStrategy(times) {
              if (times > 3) {
                logger.error('Redis 连接彻底失败，已启动熔断降级。不影响后端主工程启动。')
                return null // 返回 null 代表放弃重连
              }
              // 每次重连间隔随次数递增
              return Math.min(times * 1000, 3000)
            },

            // 当 Redis 挂掉时，后端执行 redis.get() 不会直接把 node 进程崩掉，而是让该期 Promise 报错或悬挂
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisModule, RedisService],
})
export class SharedRedisModule {}
