import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'

/** 值集（集维度，按 setCode 去重）分页查询 */
export class ValueSetGroupPageDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '集CODE', example: 'SYS_GENDER' })
  @IsString()
  @IsOptional()
  setCode?: string

  @ApiPropertyOptional({ description: '集NAME', example: '性别' })
  @IsString()
  @IsOptional()
  setName?: string

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
