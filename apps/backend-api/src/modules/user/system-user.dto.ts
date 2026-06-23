import { BatchResp } from '@/dto/batch.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsOptional } from 'class-validator'
import { IsUserFields } from './decorators/user-fields'
import { SystemRoleResp } from '../role/system-role.dto'

export class SystemUserPageDto extends PaginationQueryDto {
  @ApiProperty({ description: '用户姓名', example: '张三' })
  userName?: string
}
export class SystemUserPageOptionDto extends PaginationQueryDto {
  @ApiProperty({ description: '关键字，可输入姓名，手机号，身份证等', example: '张三' })
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的字段，默认是id,username',
    example: 'id,username,mobile',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return ['id', 'username']
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
  @IsUserFields()
  fields?: string[]
}
export class SystemUserResp {
  @Expose()
  @ApiProperty({ description: '用户ID', example: 123 })
  id: number
  @Expose()
  @Transform(({ value }) => value ?? '')
  @ApiProperty({ description: '用户名', example: 'testName' })
  userName: string
  @Expose()
  @ApiProperty({ description: '手机号', example: '13511112222' })
  mobile: string
  @Expose()
  @ApiProperty({ description: '生日', example: '1991-01-01' })
  birth: string
  @Expose()
  @Type(() => SystemRoleResp)
  roles?: SystemRoleResp[]
}
export class SystemUserPageResp extends SystemUserResp {}
export class SystemUserListResp extends BatchResp {
  list: SystemUserResp[]
}
export class SystemUserCreateDto {
  userName?: string
  nickName?: string
  gender?: string
  genderName?: string
  birth?: string
  mobile?: string
  address?: string
  addressDetail?: string
  maritalStatus?: string
  maritalStatusName?: string
  email?: string
  status?: string
}
export class SystemUserUpdateDto {
  @ApiProperty({ description: '状态，1：启用，0：禁用', example: '1' })
  status?: string
}
