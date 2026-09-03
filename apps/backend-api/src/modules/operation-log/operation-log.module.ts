import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OperationLog } from '@/modules/operation-log/entities/operation-log.entity'
import { OperationLogRepository } from '@/modules/operation-log/operation-log.repository'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogCleanupService } from '@/modules/operation-log/operation-log-cleanup.service'
import { OperationLogController } from '@/modules/operation-log/operation-log.controller'

/**
 * 全局操作日志模块。
 * 业务模块无需 import 本模块，直接在构造器注入 OperationLogService
 * 即可在任意业务节点调用 record() 记录操作日志。
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OperationLog])],
  controllers: [OperationLogController],
  providers: [OperationLogService, OperationLogRepository, OperationLogCleanupService],
  exports: [OperationLogService, OperationLogRepository],
})
export class OperationLogModule {}
