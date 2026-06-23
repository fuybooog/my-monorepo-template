import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SystemRoleResp {
  @Expose()
  @ApiProperty({ description: '角色ID', example: 123 })
  id: number
  @Expose()
  @ApiProperty({ description: '角色名称', example: 'admin' })
  roleName: string
}
