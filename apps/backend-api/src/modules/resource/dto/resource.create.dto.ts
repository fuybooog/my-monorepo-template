import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { ResourceBaseDto } from './resource.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class ResourceCreateRequiredDto {}

export class ResourceCreateDto extends IntersectionType(
  OmitType(ResourceBaseDto, ['id'] as const),
  ResourceCreateRequiredDto,
) {}
