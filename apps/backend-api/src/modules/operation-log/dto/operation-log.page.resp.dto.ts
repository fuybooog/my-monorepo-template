import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'

/** 操作日志列表行 DTO */
export class OperationLogPageRespDto {
  @ApiProperty({ description: '操作日志id', type: Number })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '日志级别：1-INFO，2-WARN，3-ERROR', type: Number })
  @IsInt()
  @Expose()
  logLevel: number

  @ApiPropertyOptional({ description: '日志级别中文：信息/警告/错误', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  logLevelText?: string

  @ApiProperty({ description: '业务模块编码', type: String })
  @IsString()
  @Expose()
  module: string

  @ApiProperty({ description: '业务模块名称', type: String })
  @IsString()
  @Expose()
  moduleText: string

  @ApiPropertyOptional({ description: '业务对象id', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  businessId?: number | null

  @ApiProperty({ description: '业务对象描述', type: String })
  @IsString()
  @Expose()
  businessText: string

  @ApiProperty({ description: '操作类型', type: String })
  @IsString()
  @Expose()
  operationType: string

  @ApiProperty({ description: '操作类型中文', type: String })
  @IsString()
  @Expose()
  operationText: string

  @ApiProperty({ description: '操作人id', type: Number })
  @IsInt()
  @Expose()
  operatorId: number

  @ApiProperty({ description: '操作人用户名', type: String })
  @IsString()
  @Expose()
  operatorName: string

  @ApiPropertyOptional({ description: '操作人IP', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  operatorIp?: string | null

  @ApiProperty({ description: '摘要', type: String })
  @IsString()
  @Expose()
  summary: string

  @ApiPropertyOptional({ description: '请求路径', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  requestUri?: string | null

  @ApiPropertyOptional({ description: '请求方法', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  requestMethod?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  @Expose()
  createdAt?: Date | null
}
