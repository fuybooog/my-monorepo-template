import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class RoleBaseDto {
  @ApiProperty({ description: '角色id' })
  @IsInt()
  id: number

  @ApiProperty({ description: '角色名称' })
  @IsString()
  roleName: string

  @ApiProperty({ description: '角色编码' })
  @IsString()
  roleCode: string

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  status?: string | null
}
