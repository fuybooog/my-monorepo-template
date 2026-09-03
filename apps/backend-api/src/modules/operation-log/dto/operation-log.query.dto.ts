import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'

/** 操作日志列表/导出共用的查询条件（不含分页） */
export class OperationLogQueryDto {
  @ApiPropertyOptional({ description: '业务模块编码：user/role/resource/value-set' })
  @IsOptional()
  @IsString()
  module?: string

  @ApiPropertyOptional({
    description: '操作类型：CREATE/UPDATE/DELETE/ENABLE/DISABLE/ASSIGN/RESET_PWD',
  })
  @IsOptional()
  @IsString()
  operationType?: string

  @ApiPropertyOptional({ description: '日志级别：1-INFO，2-WARN，3-ERROR' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  logLevel?: number

  @ApiPropertyOptional({ description: '操作人用户名（模糊匹配）' })
  @IsOptional()
  @IsString()
  operatorName?: string

  @ApiPropertyOptional({ description: '业务对象关键字（businessText 模糊匹配），如 王五' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '开始时间（含），yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss' })
  @IsOptional()
  @IsString()
  createdStart?: string

  @ApiPropertyOptional({ description: '结束时间（含），yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss' })
  @IsOptional()
  @IsString()
  createdEnd?: string
}
