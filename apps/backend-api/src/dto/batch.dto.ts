import { BaseStatusEnum } from '@/enum/base-status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class BatchDto {
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsString()
  ids: string
}
export class BatchUpdateStatusDto {
  @ApiProperty({ description: '用“,”拼接的id', example: '' })
  @IsString()
  ids: string
  @ApiProperty({ description: '状态', enum: BaseStatusEnum })
  @IsEnum(BaseStatusEnum, { message: '不合法的状态值' })
  @IsNotEmpty({ message: '状态值不能为空' })
  status: string
}
export class BatchRespDto {
  @Expose()
  @ApiPropertyOptional({ description: '未找到的id数组', example: '' })
  @IsOptional()
  notFoundIds?: number[] | string[]
}
