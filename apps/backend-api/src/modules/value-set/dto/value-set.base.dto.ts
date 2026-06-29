import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ValueSetBaseDto {
  @ApiProperty({ description: '字典id' })
  @IsInt()
  id: number

  @ApiProperty({ description: '集编码' })
  @IsString()
  setCode: string

  @ApiProperty({ description: '集名称' })
  @IsString()
  setName: string

  @ApiProperty({ description: '字典编码' })
  @IsString()
  code: string

  @ApiProperty({ description: '字典名称' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '父编码' })
  @IsString()
  @IsOptional()
  parentSetCode?: string | null

  @ApiPropertyOptional({ description: '父名称' })
  @IsString()
  @IsOptional()
  parentSetName?: string | null

  @ApiPropertyOptional({ description: '状态  0-禁用 1-启用' })
  @IsString()
  @IsOptional()
  status?: string | null

  @ApiPropertyOptional({ description: '创建人id' })
  @IsInt()
  @IsOptional()
  createdUserId?: number | null

  @ApiPropertyOptional({ description: '创建人名称' })
  @IsString()
  @IsOptional()
  createdUserName?: string | null

  @ApiPropertyOptional({ description: '修改人id' })
  @IsInt()
  @IsOptional()
  updatedUserId?: number | null

  @ApiPropertyOptional({ description: '' })
  @IsString()
  @IsOptional()
  updatedUserName?: string | null
}
