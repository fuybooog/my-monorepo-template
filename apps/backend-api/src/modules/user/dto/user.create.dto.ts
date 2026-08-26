import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { UserBaseDto } from './user.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Role } from '@/modules/role/entities/role.entity'

class UserCreateRequiredDto {
  @ApiProperty({ description: '用户名', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  userName: string
}

export class UserCreateDto extends IntersectionType(
  OmitType(UserBaseDto, ['id', 'userName'] as const),
  UserCreateRequiredDto,
) {
  @ApiPropertyOptional({ description: '用户角色', type: Array })
  @IsArray()
  @IsOptional()
  roles?: Role[]
  @ApiPropertyOptional({ description: '密码', type: Array })
  @IsString()
  @IsOptional()
  password?: string
}
