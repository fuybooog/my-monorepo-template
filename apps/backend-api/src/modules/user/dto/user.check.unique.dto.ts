import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator'

export const USER_UNIQUE_FIELDS = ['userName', 'mobile', 'email'] as const

export type UserUniqueField = (typeof USER_UNIQUE_FIELDS)[number]

export class UserCheckUniqueDto {
  @ApiProperty({ description: '要校验的字段名', enum: USER_UNIQUE_FIELDS })
  @IsIn(USER_UNIQUE_FIELDS)
  field: UserUniqueField

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
