import { OmitType } from '@nestjs/swagger'
import { ValueSetBaseDto } from './value-set.base.dto'
export class ValueSetUpdateDto extends OmitType(ValueSetBaseDto, ['id'] as const) {}
