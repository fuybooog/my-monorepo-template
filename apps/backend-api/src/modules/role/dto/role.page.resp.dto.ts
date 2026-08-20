import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { RoleBaseRespDto } from './role.base.resp.dto'
import { IsInt, IsOptional } from 'class-validator'
import { Expose } from 'class-transformer'
export class RolePageRespDto extends IntersectionType(RoleBaseRespDto) {
  @ApiProperty({ description: '用户数量', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  userCount?: number
  @ApiProperty({ description: '资源数量', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  resourceCount?: number
}
