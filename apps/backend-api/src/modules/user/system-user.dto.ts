import { BatchResp } from "@/dto/batch.dto";
import { PaginationQueryDto } from "@/dto/pagination-query.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class SystemUserPageDto extends PaginationQueryDto {
  @ApiProperty({ description: '用户姓名', example: '张三' })
  userName?: string
}
export class SystemUserPageOptionDto extends PaginationQueryDto {
  @ApiProperty({ description: '关键字，可输入姓名，手机号，身份证等', example: '张三' })
  keyword?: string
  @ApiProperty({ description: '返回的字段，默认是id，username', example: 'testId' })
  fields: string = 'id,userName'
}
export class SystemUserResp {
  @ApiProperty({ description: '用户ID', example: 123 })
  id: number
  @Expose()
  @Transform(({ value }) => value ?? '')
  @ApiProperty({ description: '用户名', example: 'testName' })
  userName: string
  @ApiProperty({ description: '年龄', example: '1岁5月' })
  age?: string
}
export class SystemUserPageResp extends SystemUserResp{
  
}
export class SystemUserListResp extends BatchResp {
  list: SystemUserResp[]
}
export class SystemUserCreateDto {}
export class SystemUserUpdateDto {
  @ApiProperty({ description: '状态，1：启用，0：禁用', example: '1岁5月' })
  status?: string
}