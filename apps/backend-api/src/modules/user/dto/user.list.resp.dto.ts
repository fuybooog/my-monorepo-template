import { BatchRespDto } from '@/dto/batch.dto'
import { UserRespDto } from './user.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
export class UserListRespDto extends BatchRespDto {
  @ApiProperty({ description: '用户列表' })
  list: UserRespDto[]
}
