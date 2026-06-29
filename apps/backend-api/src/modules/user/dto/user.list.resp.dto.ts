import { BatchRespDto } from '@/dto/batch.dto'
import { UserRespDto } from './user.resp.dto'
export class UserListRespDto extends BatchRespDto {
  list: UserRespDto[]
}
