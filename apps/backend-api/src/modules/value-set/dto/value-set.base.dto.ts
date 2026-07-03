import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ValueSetBaseDto {
  @ApiProperty({ description: '字典id', type: Number })
  @IsInt()
  id: number

  @ApiProperty({ description: '集编码', type: String })
  @IsString()
  setCode: string

  @ApiProperty({ description: '集名称', type: String })
  @IsString()
  setName: string

  @ApiProperty({ description: '字典编码', type: String })
  @IsString()
  code: string

  @ApiProperty({ description: '字典名称', type: String })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '父编码', type: String })
  @IsString()
  @IsOptional()
  parentSetCode?: string | null

  @ApiPropertyOptional({ description: '父名称', type: String })
  @IsString()
  @IsOptional()
  parentSetName?: string | null

  @ApiPropertyOptional({ description: '状态  0-禁用 1-启用', type: String })
  @IsString()
  @IsOptional()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间', type: String })
  @IsOptional()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '创建人id', type: Number })
  @IsInt()
  @IsOptional()
  createdUserId?: number | null

  @ApiPropertyOptional({ description: '创建人名称', type: String })
  @IsString()
  @IsOptional()
  createdUserName?: string | null

  @ApiPropertyOptional({ description: '修改人id', type: Number })
  @IsInt()
  @IsOptional()
  updatedUserId?: number | null

  @ApiPropertyOptional({ description: '修改人姓名', type: String })
  @IsString()
  @IsOptional()
  updatedUserName?: string | null

  @ApiPropertyOptional({ description: '删除时间', type: String })
  @IsOptional()
  deletedAt?: Date | null
}
