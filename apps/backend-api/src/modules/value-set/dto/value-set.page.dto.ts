import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { OmitType } from '@nestjs/swagger'
import { ValueSetBaseDto } from './value-set.base.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
export class ValueSetPageDto extends IntersectionType(
  OmitType(ValueSetBaseDto, ['id'] as const),
  PaginationQueryDto,
) {
  @ApiPropertyOptional({ description: '创建时间开始', example: '2000-10-10 00:00:00' })
  @IsString()
  @IsOptional()
  createdAtStart?: string

  @ApiPropertyOptional({ description: '创建时间结束', example: '2000-10-10 23:59:59' })
  @IsString()
  @IsOptional()
  createdAtEnd?: string

  @ApiPropertyOptional({ description: '修改时间开始', example: '2000-10-10 00:00:00' })
  @IsString()
  @IsOptional()
  updatedAtStart?: string

  @ApiPropertyOptional({ description: '修改时间结束', example: '2000-10-10 23:59:59' })
  @IsString()
  @IsOptional()
  updatedAtEnd?: string
}
