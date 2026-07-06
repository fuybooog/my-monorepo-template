import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class UserBaseDto {
  @ApiProperty({ description: '用户ID', type: Number })
  @IsInt()
  id: number

  @ApiProperty({ description: '用户名', type: String })
  @IsString()
  userName: string

  @ApiPropertyOptional({ description: '昵称', type: String })
  @IsString()
  @IsOptional()
  nickName?: string | null

  @ApiPropertyOptional({ description: '性别代码', type: String })
  @IsString()
  @IsOptional()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称', type: String })
  @IsString()
  @IsOptional()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日', type: String })
  @IsString()
  @IsOptional()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号', type: String })
  @IsString()
  @IsOptional()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址', type: String })
  @IsString()
  @IsOptional()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情', type: String })
  @IsString()
  @IsOptional()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码', type: String })
  @IsString()
  @IsOptional()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称', type: String })
  @IsString()
  @IsOptional()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱', type: String })
  @IsString()
  @IsOptional()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', type: String })
  @IsString()
  @IsOptional()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间', type: String })
  @IsOptional()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '删除时间', type: String })
  @IsOptional()
  deletedAt?: Date | null

  @ApiPropertyOptional({ description: '全拼', type: String })
  @IsString()
  @IsOptional()
  pinyin?: string | null

  @ApiPropertyOptional({ description: '拼音首字母', type: String })
  @IsString()
  @IsOptional()
  py?: string | null
}
