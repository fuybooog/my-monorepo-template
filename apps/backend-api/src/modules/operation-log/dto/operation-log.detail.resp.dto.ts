import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { LogFieldChange } from '@/modules/operation-log/operation-log.types'
import { OperationLogPageRespDto } from './operation-log.page.resp.dto'

/** 操作日志详情 DTO（在列表行基础上附带字段级变更明细） */
export class OperationLogDetailRespDto extends OperationLogPageRespDto {
  @ApiPropertyOptional({
    description: '字段级变更明细：[{field, fieldText, oldValue, newValue, oldText, newText}]',
    type: 'array',
  })
  @IsOptional()
  @Expose()
  detailJson?: LogFieldChange[] | null
}
