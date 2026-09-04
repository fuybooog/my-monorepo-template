import { Module } from '@nestjs/common'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { BusinessModule } from './modules/business.module'
import { SharedRedisModule } from './utils/redis/shared-redis.module'
import { SharedMysqlModule } from './utils/database/shared-mysql.module'
import { PermissionsGuard } from '@/modules/auth/auth-permission.guard'
import { SecurityModule } from './security/security.module'
import { CsrfGuard } from './security/csrf.guard'
import { GlobalThrottlerGuard } from './security/throttler.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    }),
    BusinessModule,
    SharedRedisModule,
    SharedMysqlModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [
    // 守卫按声明顺序执行：限流与 CSRF 先于鉴权，避免无效请求消耗鉴权/数据库开销
    {
      provide: APP_GUARD,
      useClass: GlobalThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
