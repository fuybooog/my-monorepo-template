import { IsOptional, Matches, Length, IsNotEmpty, IsArray } from 'class-validator'

export class GetCommonDto {
  @IsOptional()
  @Length(2, 32, { message: 'code 长度必须在 2 到 32 个字符之间' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'code 只能包含字母、数字、下划线(_)或连字符(-)，禁止包含路径特殊字符！',
  })
  code?: string
}

export class UpdateCommonDto {
  @IsNotEmpty({ message: 'json 字段不能为空' })
  @IsArray({ message: 'json 必须是一个数组格式' })
  json!: any[]
}
