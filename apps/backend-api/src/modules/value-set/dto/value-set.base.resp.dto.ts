import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ValueSetBaseRespDto {
  @ApiProperty({ description: '字典id', type: Number })
  @IsInt()
  @Expose()
  id: number

  @ApiProperty({ description: '集编码', type: String })
  @IsString()
  @Expose()
  setCode: string

  @ApiProperty({ description: '集名称', type: String })
  @IsString()
  @Expose()
  setName: string

  @ApiProperty({ description: '字典编码', type: String })
  @IsString()
  @Expose()
  code: string

  @ApiProperty({ description: '字典名称', type: String })
  @IsString()
  @Expose()
  name: string

  @ApiPropertyOptional({ description: '父编码', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  parentSetCode?: string | null

  @ApiPropertyOptional({ description: '父名称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  parentSetName?: string | null

  @ApiPropertyOptional({ description: '状态  0-禁用 1-启用', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间', type: String })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '创建人id', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  createdUserId?: number | null

  @ApiPropertyOptional({ description: '创建人名称', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  createdUserName?: string | null

  @ApiPropertyOptional({ description: '修改人id', type: Number })
  @IsInt()
  @IsOptional()
  @Expose()
  updatedUserId?: number | null

  @ApiPropertyOptional({ description: '修改人姓名', type: String })
  @IsString()
  @IsOptional()
  @Expose()
  updatedUserName?: string | null

  @ApiPropertyOptional({ description: '删除时间', type: String })
  @IsOptional()
  @Expose()
  deletedAt?: Date | null
}
