import { UserBaseRespDto } from './user.base.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Expose } from 'class-transformer'
export class UserRespDto extends UserBaseRespDto {
  @ApiProperty({ description: '角色id', type: Number })
  @IsString()
  @Expose()
  roleIds?: number[]
}
