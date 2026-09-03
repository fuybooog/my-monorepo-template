import dayjs from 'dayjs'
import { ExportColumnSpec } from '@/modules/excel/excel.types'
import { OperationLog } from '@/modules/operation-log/entities/operation-log.entity'
import { OPERATION_LOG_LEVEL_TEXT } from '@/modules/operation-log/operation-log.types'

/** 操作日志导出列定义 */
export const OPERATION_LOG_EXPORT_COLUMNS: ExportColumnSpec<Record<string, unknown>>[] = [
  { header: 'ID', key: 'id', width: 10 },
  { header: '时间', key: 'createdAtText', width: 20 },
  { header: '级别', key: 'logLevelText', width: 10 },
  { header: '业务模块', key: 'moduleText', width: 16 },
  { header: '操作', key: 'operationText', width: 10 },
  { header: '操作人', key: 'operatorName', width: 16 },
  { header: '操作人IP', key: 'operatorIp', width: 16 },
  { header: '业务对象', key: 'businessText', width: 24 },
  { header: '摘要', key: 'summary', width: 80 },
]

/** 实体 -> 导出行映射 */
export function mapOperationLogToExportRow(log: OperationLog) {
  return {
    id: log.id,
    createdAtText: log.createdAt ? dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    logLevelText: OPERATION_LOG_LEVEL_TEXT[log.logLevel] ?? String(log.logLevel),
    moduleText: log.moduleText,
    operationText: log.operationText,
    operatorName: log.operatorName,
    operatorIp: log.operatorIp ?? '',
    businessText: log.businessText,
    summary: log.summary,
  }
}
