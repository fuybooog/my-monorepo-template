import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global() // 🎯 标记为全局模块，全系统业务模块直接享用，无需重复 imports
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
          userName: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE'),
          
          // 🎯 核心工程配置
          autoLoadEntities: true, // 🚀 自动加载各个业务模块中带有 @Entity() 的类，极其省心
          synchronize: process.env.NODE_ENV !== 'production', // ⚠️ 仅在开发环境开启自动同步表结构，生产环境绝对要关闭！
          logging: process.env.NODE_ENV !== 'production', // 开发环境打印 SQL 日志，方便排查性能问题
          
          charset: 'utf8mb4', // 完美支持 Emoji 表情存入
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class SharedMysqlModule {}