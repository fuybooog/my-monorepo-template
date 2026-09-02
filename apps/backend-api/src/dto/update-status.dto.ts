import { BaseStatusEnum } from '@/enum/base-status.enum'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'

export class UpdateStatusDto {
  @IsInt()
  @IsEnum(BaseStatusEnum, { message: '不合法的状态值' })
  @IsNotEmpty({ message: '状态值不能为空' })
  @ApiProperty({ description: '状态值', enum: BaseStatusEnum })
  status: number
}
