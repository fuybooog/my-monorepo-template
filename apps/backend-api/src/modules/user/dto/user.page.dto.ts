import { ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { UserBaseDto } from './user.base.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
export class UserPageDto extends IntersectionType(
  OmitType(UserBaseDto, ['id', 'userName'] as const),
  PaginationQueryDto,
) {
  @ApiPropertyOptional({ description: '用户名', type: String })
  @IsOptional()
  @IsString()
  userName?: string

  @ApiPropertyOptional({ description: '创建日期开始', example: '2000-10-10 00:00:00' })
  @IsString()
  @IsOptional()
  createdAtStart?: string

  @ApiPropertyOptional({ description: '创建日期结束', example: '2000-10-10 23:59:59' })
  @IsString()
  @IsOptional()
  createdAtEnd?: string

  @ApiPropertyOptional({ description: '开始', example: '2000-10-10 00:00:00' })
  @IsString()
  @IsOptional()
  updatedAtStart?: string

  @ApiPropertyOptional({ description: '结束', example: '2000-10-10 23:59:59' })
  @IsString()
  @IsOptional()
  updatedAtEnd?: string
}
