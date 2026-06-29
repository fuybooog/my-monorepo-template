import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ResourceBaseRespDto {
  @ApiProperty({ description: '资源id' })
  @IsInt()
  @Expose()
  id: number

  @ApiPropertyOptional({ description: '资源名称' })
  @IsString()
  @IsOptional()
  @Expose()
  label?: string | null

  @ApiPropertyOptional({ description: '唯一编码' })
  @IsString()
  @IsOptional()
  @Expose()
  uniqueProp?: string | null

  @ApiPropertyOptional({ description: '唯一父编码' })
  @IsString()
  @IsOptional()
  @Expose()
  parentUniqueProp?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  @Expose()
  status?: string | null

  @ApiPropertyOptional({ description: '资源类型：1-页面 2-按钮 3-列' })
  @IsString()
  @IsOptional()
  @Expose()
  type?: string | null

  @ApiPropertyOptional({ description: '排序号' })
  @IsInt()
  @IsOptional()
  @Expose()
  sortNumber?: number | null

  @ApiPropertyOptional({ description: '创建时间' })
  @IsOptional()
  @Expose()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '' })
  @IsOptional()
  @Expose()
  updatedAt?: Date | null
}
