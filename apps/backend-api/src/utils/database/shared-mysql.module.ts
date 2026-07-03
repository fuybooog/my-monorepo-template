import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE'),

          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test',
          logging:
            process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
              ? ['query', 'error']
              : false,

          charset: 'utf8mb4',
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class SharedMysqlModule {}
