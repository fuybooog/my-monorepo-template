import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class RoleBaseRespDto {
  @ApiProperty({ description: '角色id', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  id?: number

  @ApiProperty({ description: '角色名称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  roleName?: string

  @ApiProperty({ description: '角色编码', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  roleCode?: string

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
}
