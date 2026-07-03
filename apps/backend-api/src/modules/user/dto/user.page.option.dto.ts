import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { IsUserFields } from '../decorators/user-fields'
export class UserPageOptionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '关键字', example: '' })
  @IsOptional()
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的列表字段',
    example: '',
  })
  @IsOptional()
  @IsUserFields()
  fields?: string = 'id,userName'
}
