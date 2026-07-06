import { BatchRespDto } from '@/dto/batch.dto'
import { ResourceRespDto } from './resource.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
export class ResourceListRespDto extends BatchRespDto {
  @ApiProperty({ description: '列表' })
  @Expose()
  list: ResourceRespDto[]
}
