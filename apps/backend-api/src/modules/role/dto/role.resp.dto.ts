import { RoleBaseRespDto } from './role.base.resp.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Expose } from 'class-transformer'
export class RoleRespDto extends RoleBaseRespDto {
  // @ApiProperty({ description: '用户id列表', type: [Number] })
  // @IsArray()
  // @IsOptional()
  // @Expose()
  // userIds?: number[]
  // @ApiProperty({ description: '资源id列表', type: [Number] })
  // @IsArray()
  // @IsOptional()
  // @Expose()
  // resourceIds?: number[]
  @ApiProperty({ description: '用户id列表', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  userIds?: string
  @ApiProperty({ description: '资源id列表', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  resourceIds?: string
}
