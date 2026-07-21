import { ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString } from 'class-validator'
import { UserBaseDto } from './user.base.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import type { SortType } from '@/types'
import { Transform } from 'class-transformer'
export class UserPageDto extends IntersectionType(
  OmitType(UserBaseDto, ['id', 'userName'] as const),
  PaginationQueryDto,
) {
  @ApiPropertyOptional({ description: '用户名', type: String })
  @IsOptional()
  @IsString()
  userName?: string

  @ApiPropertyOptional({ description: '生日日期开始', example: '2000-10-10' })
  @IsString()
  @IsOptional()
  birthStart?: string

  @ApiPropertyOptional({ description: '生日日期结束', example: '2000-10-10' })
  @IsString()
  @IsOptional()
  birthEnd?: string

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

  @ApiPropertyOptional({
    description: '排序对象',
    example: { userName: 'ASC', createdAt: 'DESC' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (!value || typeof value !== 'object') return value

    // 转换为标准大写，并过滤掉非 ASC/DESC 的非法输入，防止 SQL 注入
    const cleanSort: SortType = {}
    for (const key in value) {
      const direction = String(value[key]).toUpperCase()
      if (direction === 'ASC' || direction === 'DESC') {
        cleanSort[key] = direction
      }
    }
    return cleanSort
  })
  sort?: SortType
}
