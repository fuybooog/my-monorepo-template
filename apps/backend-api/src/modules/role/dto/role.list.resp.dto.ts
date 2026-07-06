import { BatchRespDto } from '@/dto/batch.dto'
import { RoleRespDto } from './role.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
export class RoleListRespDto extends BatchRespDto {
  @ApiProperty({ description: '列表' })
  @Expose()
  list: RoleRespDto[]
}
