import { BatchRespDto } from '@/dto/batch.dto'
import { ValueSetRespDto } from './value-set.resp.dto'
export class ValueSetListRespDto extends BatchRespDto {
  list: ValueSetRespDto[]
}
