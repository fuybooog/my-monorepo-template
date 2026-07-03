import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { ValueSetBaseDto } from './value-set.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class ValueSetCreateRequiredDto {}

export class ValueSetCreateDto extends IntersectionType(
  OmitType(ValueSetBaseDto, ['id'] as const),
  ValueSetCreateRequiredDto,
) {}
