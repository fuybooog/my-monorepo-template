import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class RoleBaseRespDto {
  @ApiProperty({ description: '角色id' })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '角色名称' })
  @IsString()
  @Expose()
  roleName: string

  @ApiProperty({ description: '角色编码' })
  @IsString()
  @Expose()
  roleCode: string

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间' })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '' })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null
}
