import { Module } from '@nestjs/common'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { BusinessModule } from './modules/business.module'
import { SharedRedisModule } from './utils/redis/shared-redis.module'
import { SharedMysqlModule } from './utils/database/shared-mysql.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BusinessModule,
    SharedRedisModule,
    SharedMysqlModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
