import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ValueSetBaseRespDto {
  @ApiProperty({ description: '字典id' })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '集编码' })
  @IsString()
  @Expose()
  setCode: string

  @ApiProperty({ description: '集名称' })
  @IsString()
  @Expose()
  setName: string

  @ApiProperty({ description: '字典编码' })
  @IsString()
  @Expose()
  code: string

  @ApiProperty({ description: '字典名称' })
  @IsString()
  @Expose()
  name: string

  @ApiPropertyOptional({ description: '父编码' })
  @IsString()
  @IsOptional()
  @Expose()
  parentSetCode?: string | null

  @ApiPropertyOptional({ description: '父名称' })
  @IsString()
  @IsOptional()
  @Expose()
  parentSetName?: string | null

  @ApiPropertyOptional({ description: '状态  0-禁用 1-启用' })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间' })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间' })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '创建人id' })
  @IsInt()
  @IsOptional()
  @Expose()
  createdUserId?: number | null

  @ApiPropertyOptional({ description: '创建人名称' })
  @IsString()
  @IsOptional()
  @Expose()
  createdUserName?: string | null

  @ApiPropertyOptional({ description: '修改人id' })
  @IsInt()
  @IsOptional()
  @Expose()
  updatedUserId?: number | null

  @ApiPropertyOptional({ description: '' })
  @IsString()
  @IsOptional()
  @Expose()
  updatedUserName?: string | null
}
