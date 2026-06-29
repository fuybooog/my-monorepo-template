import { OmitType } from '@nestjs/swagger'
import { ValueSetBaseDto } from './value-set.base.dto'
export class ValueSetCreateDto extends OmitType(ValueSetBaseDto, ['id'] as const) {}
