import { IsOptional, IsInt, Min, Max } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: '页码' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({ description: '每页条数' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize: number = 10
}
