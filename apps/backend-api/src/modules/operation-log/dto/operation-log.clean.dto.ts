import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches } from 'class-validator'

/**
 * 日志清理入参。
 * - 不传 logLevel：按默认保留策略清理（INFO 180 天 / WARN 365 天 / ERROR 730 天）；
 * - 传 logLevel：仅清理该级别，时间阈值优先取 beforeDate，否则取该级别默认保留期；
 * - dryRun=true：只返回将删除的数量，不实际删除（前端先用预览再确认）。
 */
export class OperationLogCleanDto {
  @ApiPropertyOptional({
    description: '仅清理该级别：1-INFO，2-WARN，3-ERROR；缺省按各级别默认保留策略',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3])
  logLevel?: number

  @ApiPropertyOptional({
    description: '清理该日期(不含)之前的日志，yyyy-MM-dd；缺省按保留策略自动计算',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'beforeDate 格式应为 yyyy-MM-dd' })
  beforeDate?: string

  @ApiPropertyOptional({ description: '仅预览不执行，返回将删除数量', default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  dryRun?: boolean
}
