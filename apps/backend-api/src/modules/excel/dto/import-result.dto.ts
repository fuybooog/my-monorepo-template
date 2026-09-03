import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** 导入失败的某一行明细 */
export class ImportFailedRowDto {
  @ApiProperty({ description: 'Excel 行号（表头下一行计为 2）', example: 2 })
  rowNo: number

  @ApiProperty({
    description: '错误信息：中文列名 -> 错误原因',
    type: Object,
    example: { 用户名: '用户名「admin」与系统中已有数据重复', 角色: '角色「super」不存在' },
  })
  errors: Record<string, string>
}

/** Excel 导入结果（供所有模块的导入接口复用） */
export class ImportResultDto {
  @ApiProperty({ description: '文件数据总行数', example: 100 })
  total: number

  @ApiProperty({ description: '成功导入行数', example: 98 })
  successCount: number

  @ApiProperty({ description: '失败行数', example: 2 })
  failCount: number

  @ApiPropertyOptional({
    description: '失败行明细（空数组表示全部成功）',
    type: [ImportFailedRowDto],
  })
  failedRows?: ImportFailedRowDto[]
}
