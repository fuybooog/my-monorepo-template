import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsOptional } from 'class-validator'
export class UserPageOptionDto extends PaginationQueryDto {
  @ApiProperty({ description: '关键字', example: '' })
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的列表字段',
    example: '',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      // 默认返回的字段
      return ['id']
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return value
  })
  @IsArray()
  fields?: string[]
}
