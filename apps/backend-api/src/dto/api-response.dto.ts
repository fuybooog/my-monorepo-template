import { ApiProperty } from '@nestjs/swagger'
import { ResponseHeadDto } from '@/dto/response-head.dto'

export class ApiResponseDto<T> {
  @ApiProperty({ type: ResponseHeadDto })
  head!: ResponseHeadDto

  data!: T
}
