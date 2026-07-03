import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { UserBaseDto } from './user.base.dto'
import { IsArray, IsOptional, IsString } from 'class-validator'
import { Role } from '@/modules/role/entities/role.entity'
export class UserUpdateDto extends OmitType(UserBaseDto, ['id', 'userName'] as const) {
  @ApiPropertyOptional({ description: '用户名', type: String })
  @IsOptional()
  @IsString()
  userName?: string

  @ApiPropertyOptional({ description: '用户角色', type: Array })
  @IsArray()
  @IsOptional()
  roles?: Role[]
}
