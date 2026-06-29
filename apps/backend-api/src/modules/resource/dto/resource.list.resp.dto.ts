import { BatchRespDto } from '@/dto/batch.dto'
import { ResourceRespDto } from './resource.resp.dto'
export class ResourceListRespDto extends BatchRespDto {
  list: ResourceRespDto[]
}
