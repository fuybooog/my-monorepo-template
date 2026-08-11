import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ListResp<T> {
  @ApiProperty({ description: '列表', example: '' })
  @IsString()
  list: T[]
}
