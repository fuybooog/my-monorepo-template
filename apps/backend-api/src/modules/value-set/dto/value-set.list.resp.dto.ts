import { BatchRespDto } from '@/dto/batch.dto'
import { ValueSetRespDto } from './value-set.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
export class ValueSetListRespDto extends BatchRespDto {
  @ApiProperty({ description: '列表', type: [ValueSetRespDto], required: true })
  @Expose()
  list: ValueSetRespDto[]
}
