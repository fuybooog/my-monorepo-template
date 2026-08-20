import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { RoleBaseDto } from './role.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class RoleCreateRequiredDto {
  @ApiProperty({ description: '角色名称', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  roleName: string
  @ApiProperty({ description: '角色编码', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '角色编码不能为空' })
  roleCode: string
}

export class RoleCreateDto extends IntersectionType(
  OmitType(RoleBaseDto, ['id', 'roleCode', 'roleName'] as const),
  RoleCreateRequiredDto,
) {
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsOptional()
  @IsString()
  userIds?: string
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsOptional()
  @IsString()
  resourceIds?: string
}
