import { BatchResp } from '@/dto/batch.dto'
import { UserResp } from './user.resp.dto'
export class UserListResp extends BatchResp {
  list: UserResp[]
}
