import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
export class ValueSetPageOptionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '关键字', example: '' })
  @IsOptional()
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的列表字段',
    example: '',
  })
  @IsOptional()
  fields?: string = 'id'
}
