import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class UserBaseDto {
  @ApiProperty({ description: '用户id' })
  @IsInt()
  id: number

  @ApiProperty({ description: '用户名' })
  @IsString()
  userName: string

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickName?: string | null

  @ApiPropertyOptional({ description: '密码' })
  @IsString()
  @IsOptional()
  password?: string | null

  @ApiPropertyOptional({ description: '性别代码' })
  @IsString()
  @IsOptional()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称' })
  @IsString()
  @IsOptional()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日' })
  @IsString()
  @IsOptional()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址' })
  @IsString()
  @IsOptional()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情' })
  @IsString()
  @IsOptional()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码' })
  @IsString()
  @IsOptional()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称' })
  @IsString()
  @IsOptional()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱' })
  @IsString()
  @IsOptional()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  status?: string | null
}
