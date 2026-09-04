import { BaseStatusEnum } from '@/enum/base-status.enum'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'
import { Transform } from 'class-transformer'

/** 兼容前端以字符串数字提交（'0'/'1'） */
const toOptionalNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined
  return Number(value)
}

export class UpdateStatusDto {
  @Transform(toOptionalNumber)
  @IsInt()
  @IsEnum(BaseStatusEnum, { message: '不合法的状态值' })
  @IsNotEmpty({ message: '状态值不能为空' })
  @ApiProperty({ description: '状态值', enum: BaseStatusEnum })
  status: number
}
