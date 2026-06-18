import { ApiProperty } from '@nestjs/swagger'

export class ResponseHeadDto {
  @ApiProperty({ description: '错误码，0 代表成功', example: 0 })
  errCode!: number

  @ApiProperty({ description: '错误信息描述', example: 'success' })
  errMsg!: string
}
