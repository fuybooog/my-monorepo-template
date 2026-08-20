import { ApiProperty, OmitType } from '@nestjs/swagger'
import { RoleBaseDto } from './role.base.dto'
import { IsOptional, IsString } from 'class-validator'
export class RoleUpdateDto extends OmitType(RoleBaseDto, ['id'] as const) {
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsOptional()
  @IsString()
  userIds?: string
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsOptional()
  @IsString()
  resourceIds?: string
}
