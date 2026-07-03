import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class UserBaseRespDto {
  @ApiProperty({ description: '用户id', type: Number })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '用户名', type: String })
  @IsString()
  @Expose()
  userName: string

  @ApiPropertyOptional({ description: '昵称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  nickName?: string | null

  @ApiPropertyOptional({ description: '性别代码', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  gender?: string | null

  @ApiPropertyOptional({ description: '性别名称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  genderName?: string | null

  @ApiPropertyOptional({ description: '生日', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  birth?: string | null

  @ApiPropertyOptional({ description: '手机号', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  mobile?: string | null

  @ApiPropertyOptional({ description: '地址', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  address?: string | null

  @ApiPropertyOptional({ description: '地址详情', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  addressDetail?: string | null

  @ApiPropertyOptional({ description: '婚姻状况代码', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatus?: string | null

  @ApiPropertyOptional({ description: '婚姻状况名称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  maritalStatusName?: string | null

  @ApiPropertyOptional({ description: '邮箱', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  email?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间', type: String })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '删除时间', type: String })
  @IsOptional()
  @Expose()
  deletedAt?: Date | null

  @ApiPropertyOptional({ description: '全拼', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  pinyin?: string | null

  @ApiPropertyOptional({ description: '拼音首字母', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  py?: string | null
}
