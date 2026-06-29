import { BatchRespDto } from '@/dto/batch.dto'
import { RoleRespDto } from './role.resp.dto'
export class RoleListRespDto extends BatchRespDto {
  list: RoleRespDto[]
}
