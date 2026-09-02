import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

/** 值集（集维度，按 setCode 去重）分页响应 */
export class ValueSetGroupPageRespDto {
  @ApiProperty({ description: '集编码' })
  @Expose()
  setCode: string

  @ApiProperty({ description: '集名称' })
  @Expose()
  setName: string

  @ApiProperty({ description: '集下值的数量' })
  @Expose()
  valueCount: number

  @ApiProperty({ description: '状态（取集下值状态的最大值：1=启用，0=禁用）' })
  @Expose()
  status: number

  @ApiProperty({ description: '创建时间' })
  @Expose()
  createdAt?: string

  @ApiProperty({ description: '更新时间' })
  @Expose()
  updatedAt?: string
}
