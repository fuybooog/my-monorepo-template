import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { RoleBaseDto } from './role.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class RoleCreateRequiredDto {}

export class RoleCreateDto extends IntersectionType(
  OmitType(RoleBaseDto, ['id'] as const),
  RoleCreateRequiredDto,
) {}
