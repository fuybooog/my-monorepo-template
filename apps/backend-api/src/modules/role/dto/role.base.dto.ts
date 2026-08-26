import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class RoleBaseDto {
  @ApiProperty({ description: '角色id', type: Number })
  @IsInt()
  @IsOptional()
  id?: number

  @ApiProperty({ description: '角色名称', type: String })
  @IsString()
  @IsOptional()
  roleName?: string

  @ApiProperty({ description: '角色编码', type: String })
  @IsString()
  @IsOptional()
  roleCode?: string

  @ApiProperty({ description: '角色等级', type: Number })
  @IsInt()
  @IsOptional()
  level?: number

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
}
