import { IntersectionType } from '@nestjs/swagger'
import { ValueSetBaseRespDto } from './value-set.base.resp.dto'
export class ValueSetPageRespDto extends IntersectionType(ValueSetBaseRespDto) {}
