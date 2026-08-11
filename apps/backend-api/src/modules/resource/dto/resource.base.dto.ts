import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ResourceBaseDto {
  @ApiProperty({ description: '资源id', type: Number })
  @IsInt()
  id: number

  @ApiPropertyOptional({ description: '资源名称', type: String })
  @IsString()
  @IsOptional()
  label?: string | null

  @ApiPropertyOptional({ description: '唯一编码', type: String })
  @IsString()
  @IsOptional()
  uniqueProp?: string | null

  @ApiPropertyOptional({ description: '唯一父编码', type: String })
  @IsString()
  @IsOptional()
  parentUniqueProp?: string | null

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', type: String })
  @IsString()
  @IsOptional()
  status?: string | null

  @ApiPropertyOptional({ description: '资源类型：0-目录 1-页面 2-按钮 3-列', type: String })
  @IsString()
  @IsOptional()
  type?: string | null

  @ApiPropertyOptional({
    description: '是否在菜单中显示，默认为空，表示显示，设置为1时表示不显示',
    type: String,
  })
  @IsString()
  @IsOptional()
  notInMenu?: string | null

  @ApiPropertyOptional({ description: '排序号', type: Number })
  @IsInt()
  @IsOptional()
  sortNumber?: number | null

  @ApiPropertyOptional({ description: '菜单路径', type: String })
  @IsString()
  @IsOptional()
  menuPath?: string | null

  @ApiPropertyOptional({ description: '创建时间', type: String })
  @IsOptional()
  createdAt?: Date | null

  @ApiPropertyOptional({ description: '修改时间', type: String })
  @IsOptional()
  updatedAt?: Date | null

  @ApiPropertyOptional({ description: '删除时间', type: String })
  @IsOptional()
  deletedAt?: Date | null
}
