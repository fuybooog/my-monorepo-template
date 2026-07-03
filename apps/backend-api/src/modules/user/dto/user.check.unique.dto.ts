import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator'

export class UserCheckUniqueDto {
  @ApiProperty({ description: '要校验的字段名', enum: ['userName', 'mobile'] })
  @IsIn(['userName', 'mobile'])
  field: 'userName' | 'mobile'

  @ApiProperty({ description: '要校验的字段值', example: 'admin' })
  @IsString()
  @MinLength(1)
  value: string

  @ApiPropertyOptional({ description: '要排除的id', example: 2 })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  @IsOptional()
  id?: number
}
