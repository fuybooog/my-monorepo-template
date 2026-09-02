import { ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger'
import { ValueSetBaseDto } from './value-set.base.dto'
import { IsOptional, IsString } from 'class-validator'

class ValueSetUpdateOptionalDto {
  @ApiPropertyOptional({ description: '值编码（编辑集时无需传）' })
  @IsOptional()
  @IsString()
  code?: string

  @ApiPropertyOptional({ description: '值名称（编辑集时无需传）' })
  @IsOptional()
  @IsString()
  name?: string
}

export class ValueSetUpdateDto extends IntersectionType(
  OmitType(ValueSetBaseDto, ['id'] as const),
  ValueSetUpdateOptionalDto,
) {}
