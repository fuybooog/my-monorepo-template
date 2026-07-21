import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ValueSetBaseDto } from './value-set.base.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
export class ValueSetPageDto extends IntersectionType(
  OmitType(ValueSetBaseDto, ['id', 'setCode', 'setName', 'code', 'name'] as const),
  PaginationQueryDto,
) {
  @ApiPropertyOptional({ description: '集CODE', example: 'SYS_GENDER' })
  @IsString()
  @IsOptional()
  setCode?: string

  @ApiPropertyOptional({ description: '集NAME', example: '性别' })
  @IsString()
  @IsOptional()
  setName?: string

  @ApiPropertyOptional({ description: '值CODE', example: '1' })
  @IsString()
  @IsOptional()
  code?: string

  @ApiPropertyOptional({ description: '值NAME', example: '男' })
  @IsString()
  @IsOptional()
  name?: string

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

export class ValueSetListDto {
  @ApiProperty({ description: ',分隔的集CODE' })
  @IsString()
  @IsNotEmpty()
  setCodes: string
}
