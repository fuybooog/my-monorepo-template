import { IntersectionType } from '@nestjs/swagger'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { OperationLogQueryDto } from './operation-log.query.dto'

/** 操作日志分页查询 DTO */
export class OperationLogPageDto extends IntersectionType(
  OperationLogQueryDto,
  PaginationQueryDto,
) {}
