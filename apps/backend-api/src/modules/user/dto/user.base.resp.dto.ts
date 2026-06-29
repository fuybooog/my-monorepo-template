import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class UserBaseRespDto {
  @ApiProperty({ description: '用户id' })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '用户名' })
  @IsString()
  @Expose()
  userName: string

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  @Expose()
  nickName?: string | null

  @ApiPropertyOptional({ description: '密码' })
  @IsString()
  @IsOptional()
  @Expose()
  password?: string | null

  @ApiPropertyOptional({ description: '性别代码' })
  @IsString()
  @IsOptional()
  @Expose()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称' })
  @IsString()
  @IsOptional()
  @Expose()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日' })
  @IsString()
  @IsOptional()
  @Expose()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  @Expose()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址' })
  @IsString()
  @IsOptional()
  @Expose()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情' })
  @IsString()
  @IsOptional()
  @Expose()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码' })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称' })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱' })
  @IsString()
  @IsOptional()
  @Expose()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建日期' })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '' })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null
}
