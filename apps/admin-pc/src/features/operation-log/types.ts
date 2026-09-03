/**
 * 操作日志前端类型定义。
 * 与后端 modules/operation-log 的 DTO 字段保持一致
 * （@repo/types 的 DTO 生成由后端 openapi 流程产出，此处本地类型保证前端可独立编译）。
 */

/** 字段级变更明细（后端 detailJson 每项） */
export interface LogFieldChange {
  field: string
  fieldText: string
  oldValue?: unknown
  newValue?: unknown
  oldText: string
  newText: string
}

/** 列表行 */
export interface OperationLogPageRespDto {
  id: number
  /** 1-INFO 2-WARN 3-ERROR */
  logLevel: number
  logLevelText: string
  module: string
  moduleText: string
  businessId?: number | null
  businessText: string
  operationType: string
  operationText: string
  operatorId: number
  operatorName: string
  operatorIp?: string | null
  summary: string
  requestUri?: string | null
  requestMethod?: string | null
  createdAt?: string | null
}

/** 详情（含字段级变更明细） */
export interface OperationLogDetailRespDto extends OperationLogPageRespDto {
  detailJson?: LogFieldChange[] | null
}

/** 分页/导出查询条件 */
export interface OperationLogPageQuery {
  page?: number
  pageSize?: number
  module?: string
  operationType?: string
  logLevel?: number
  operatorName?: string
  keyword?: string
  createdStart?: string
  createdEnd?: string
}

/** 清理入参 */
export interface OperationLogCleanPayload {
  logLevel?: number
  /** yyyy-MM-dd，只清理该日期（不含）之前 */
  beforeDate?: string
  dryRun: boolean
}

/** 清理结果 */
export interface OperationLogCleanResult {
  dryRun: boolean
  /** 命中条数 */
  willDelete: number
  /** 实际删除条数 */
  deleted: number
  archivedFile?: string | null
}
