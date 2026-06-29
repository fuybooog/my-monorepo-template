import { BatchResp } from '@/dto/batch.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator'

export class UserBaseDto {
  @ApiProperty({ description: '用户id', example: '' })
  @IsInt()
  id: number

  @ApiProperty({ description: '用户名', example: '' })
  @IsString()
  userName: string

  @ApiPropertyOptional({ description: '昵称', example: '' })
  @IsString()
  @IsOptional()
  nickName?: string | null

  @ApiPropertyOptional({ description: '密码', example: '' })
  @IsString()
  @IsOptional()
  password?: string | null

  @ApiPropertyOptional({ description: '性别代码', example: '' })
  @IsString()
  @IsOptional()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称', example: '' })
  @IsString()
  @IsOptional()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日', example: '' })
  @IsString()
  @IsOptional()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号', example: '' })
  @IsString()
  @IsOptional()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址', example: '' })
  @IsString()
  @IsOptional()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情', example: '' })
  @IsString()
  @IsOptional()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码', example: '' })
  @IsString()
  @IsOptional()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称', example: '' })
  @IsString()
  @IsOptional()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱', example: '' })
  @IsString()
  @IsOptional()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', example: '' })
  @IsString()
  @IsOptional()
  status?: string | null
}

export class UserBaseRespDto {
  @ApiProperty({ description: '用户id', example: '' })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '用户名', example: '' })
  @IsString()
  @Expose()
  userName: string

  @ApiPropertyOptional({ description: '昵称', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  nickName?: string | null

  @ApiPropertyOptional({ description: '密码', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  password?: string | null

  @ApiPropertyOptional({ description: '性别代码', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', example: '' })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建日期', example: '' })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '', example: '' })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null
}

export class UserPageDto extends OmitType(UserBaseDto, ['id'] as const) {
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
export class UserResp extends UserBaseRespDto {}
export class UserPageResp extends UserBaseRespDto {}
export class UserListResp extends BatchResp {
  list: UserResp[]
}
export class UserCreateDto extends OmitType(UserBaseDto, ['id'] as const) {}
export class UserUpdateDto extends OmitType(UserBaseDto, ['id'] as const) {}
