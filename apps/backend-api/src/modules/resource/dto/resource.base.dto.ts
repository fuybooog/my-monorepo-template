import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ResourceBaseDto {
  @ApiProperty({ description: '资源id' })
  @IsInt()
  id: number

  @ApiPropertyOptional({ description: '资源名称' })
  @IsString()
  @IsOptional()
  label?: string | null

  @ApiPropertyOptional({ description: '唯一编码' })
  @IsString()
  @IsOptional()
  uniqueProp?: string | null

  @ApiPropertyOptional({ description: '唯一父编码' })
  @IsString()
  @IsOptional()
  parentUniqueProp?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用' })
  @IsString()
  @IsOptional()
  status?: string | null

  @ApiPropertyOptional({ description: '资源类型：1-页面 2-按钮 3-列' })
  @IsString()
  @IsOptional()
  type?: string | null

  @ApiPropertyOptional({ description: '排序号' })
  @IsInt()
  @IsOptional()
  sortNumber?: number | null
}
