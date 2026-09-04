import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import dayjs from 'dayjs'
import { ExcelService } from '@/modules/excel/excel.service'
import { OperationLog } from '@/modules/operation-log/entities/operation-log.entity'
import { OperationLogRepository } from '@/modules/operation-log/operation-log.repository'
import { OperationLogPageDto } from '@/modules/operation-log/dto/operation-log.page.dto'
import { OperationLogPageRespDto } from '@/modules/operation-log/dto/operation-log.page.resp.dto'
import { OperationLogDetailRespDto } from '@/modules/operation-log/dto/operation-log.detail.resp.dto'
import { OperationLogCleanDto } from '@/modules/operation-log/dto/operation-log.clean.dto'
import {
  OPERATION_LOG_ACTION_TEXT,
  OPERATION_LOG_LEVEL_TEXT,
  OPERATION_LOG_MODULES,
  OperationLogAction,
  OperationLogLevel,
  RecordOperationLogInput,
} from '@/modules/operation-log/operation-log.types'
import { buildChangeSummary } from '@/modules/operation-log/log-diff'
import { getCurrentOperationLogActor } from '@/modules/operation-log/operation-log.context'
import { mapOperationLogToExportRow, OPERATION_LOG_EXPORT_COLUMNS } from './operation-log.export'

/** 各级别默认保留天数：INFO 180 天 / WARN 365 天 / ERROR 730 天 */
export const KEEP_DAYS_BY_LEVEL: Record<number, number> = {
  [OperationLogLevel.INFO]: 180,
  [OperationLogLevel.WARN]: 365,
  [OperationLogLevel.ERROR]: 730,
}

export interface OperationLogCleanResult {
  dryRun: boolean
  /** 满足清理条件的记录总数 */
  willDelete: number
  /** 实际删除条数（dryRun 时为 0） */
  deleted: number
  /** 本次清理前的归档文件路径（dryRun 时为 null） */
  archivedFile: string | null
}

/** 归档目录默认值：后端进程工作目录下 archive/ */
function resolveArchiveDir(): string {
  return process.env.LOG_ARCHIVE_DIR || path.resolve(process.cwd(), 'archive')
}

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name)

  constructor(
    private readonly logRepository: OperationLogRepository,
    private readonly excelService: ExcelService,
  ) {}

  // ---------------------------------------------------------------- 写入

  /**
   * 记录一条操作日志（业务埋点入口）。
   * 操作人默认取自请求上下文（AsyncLocalStorage），无上下文（系统任务等）时为 0/系统。
   */
  async record(input: RecordOperationLogInput): Promise<void> {
    const actor = getCurrentOperationLogActor()

    const level = input.level ?? OperationLogLevel.INFO
    const operatorId = input.actor?.userId ?? actor?.userId ?? 0
    const operatorName = input.actor?.userName ?? actor?.userName ?? '系统'
    const operatorIp = input.actor?.operatorIp ?? actor?.operatorIp ?? null
    const operationText =
      OPERATION_LOG_ACTION_TEXT[input.operationType] ?? String(input.operationType)
    const moduleText = OPERATION_LOG_MODULES[input.module] ?? input.module
    const summary =
      input.summary ??
      buildChangeSummary(operatorName, operationText, input.businessText, input.changes)

    const entity = this.logRepository.create({
      logLevel: level,
      module: input.module,
      moduleText,
      businessId: input.businessId ?? null,
      businessText: input.businessText,
      operationType: String(input.operationType),
      operationText,
      operatorId,
      operatorName,
      operatorIp,
      summary,
      detailJson: input.changes && input.changes.length > 0 ? input.changes : null,
      requestUri: actor?.requestUri ?? null,
      requestMethod: actor?.requestMethod ?? null,
    })

    await this.logRepository.insert(entity)
  }

  /** 日志模块自身操作也要留痕时使用（module='operation-log'） */
  recordLogAction(
    businessText: string,
    action: OperationLogAction,
    level = OperationLogLevel.INFO,
  ) {
    return this.record({ module: 'operation-log', businessText, operationType: action, level })
  }

  // ---------------------------------------------------------------- 查询

  /** 实体 -> 列表响应 */
  private toPageResp(log: OperationLog): OperationLogPageRespDto {
    return {
      id: log.id,
      logLevel: log.logLevel,
      logLevelText: OPERATION_LOG_LEVEL_TEXT[log.logLevel] ?? String(log.logLevel),
      module: log.module,
      moduleText: log.moduleText,
      businessId: log.businessId,
      businessText: log.businessText,
      operationType: log.operationType,
      operationText: log.operationText,
      operatorId: log.operatorId,
      operatorName: log.operatorName,
      operatorIp: log.operatorIp,
      summary: log.summary,
      requestUri: log.requestUri,
      requestMethod: log.requestMethod,
      createdAt: log.createdAt,
    }
  }

  /** 分页查询 */
  async pageLog(query: OperationLogPageDto) {
    const { list, total, page, pageSize } = await this.logRepository.searchLogsByPage(query)
    return { list: list.map((log) => this.toPageResp(log)), total, page, pageSize }
  }

  /** 详情（含字段级变更明细） */
  async findLogById(id: number): Promise<OperationLogDetailRespDto> {
    const log = await this.logRepository.findOne({ where: { id } })
    if (!log) {
      throw new NotFoundException('操作日志不存在')
    }
    return { ...this.toPageResp(log), detailJson: log.detailJson as never }
  }

  // ---------------------------------------------------------------- 导出

  /** 按查询条件导出为 xlsx，返回下载流缓冲与文件名 */
  async exportLogs(query: OperationLogPageDto): Promise<{ buffer: Buffer; fileName: string }> {
    const logs = await this.logRepository.searchLogsForExport(query)
    const buffer = await this.excelService.buildExportBuffer(
      '操作日志',
      OPERATION_LOG_EXPORT_COLUMNS,
      logs.map((log) => mapOperationLogToExportRow(log)),
    )
    const fileName = `操作日志_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    // 导出留痕（失败不阻塞文件下载）
    try {
      await this.recordLogAction(`导出操作日志：共 ${logs.length} 条`, OperationLogAction.EXPORT)
    } catch (error) {
      this.logger.error('操作日志导出留痕失败', error)
    }
    return { buffer, fileName }
  }

  // ---------------------------------------------------------------- 清理与归档

  /**
   * 手动清理（/operation-log/clean）。
   * 规则：
   * - 传 beforeDate：清理 created_at < beforeDate 的日志（可按 logLevel 收窄）；
   * - 只传 logLevel：按该级别默认保留天数计算阈值；
   * - 都不传：按 INFO 180 / WARN 365 / ERROR 730 天默认策略分组清理。
   * 执行前先归档为 JSONL 文件，再物理删除。
   */
  async cleanLogs(dto: OperationLogCleanDto): Promise<OperationLogCleanResult> {
    const dryRun = dto.dryRun !== false

    // 组装待清理分组
    const groups: { level?: number; before: string }[] = []
    if (dto.beforeDate) {
      const before = dayjs(dto.beforeDate).format('YYYY-MM-DD 00:00:00')
      groups.push({ level: dto.logLevel, before })
    } else if (dto.logLevel) {
      const keepDays = KEEP_DAYS_BY_LEVEL[dto.logLevel]
      const before = dayjs().subtract(keepDays, 'day').format('YYYY-MM-DD 00:00:00')
      groups.push({ level: dto.logLevel, before })
    } else {
      for (const [level, keepDays] of Object.entries(KEEP_DAYS_BY_LEVEL)) {
        groups.push({
          level: Number(level),
          before: dayjs().subtract(keepDays, 'day').format('YYYY-MM-DD 00:00:00'),
        })
      }
    }

    let willDelete = 0
    for (const group of groups) {
      willDelete += await this.logRepository.countExpired(group.before, group.level)
    }

    if (dryRun || willDelete === 0) {
      return { dryRun, willDelete, deleted: 0, archivedFile: null }
    }

    // 非 dryRun：分页取出 -> 归档 -> 物理删除
    const archivedFile = resolveArchiveDir()
    fs.mkdirSync(archivedFile, { recursive: true })
    const archivePath = path.join(
      archivedFile,
      `operation-log-${dayjs().format('YYYYMMDDHHmmss')}.jsonl`,
    )

    let deleted = 0
    let page = 1
    const BATCH = 1000
    for (const group of groups) {
      page = 1
      for (;;) {
        const ids = await this.logRepository.findExpiredIds(group.before, group.level, page, BATCH)
        if (ids.length === 0) break

        const rows = await this.logRepository.findByIds(ids)
        if (rows.length > 0) {
          const lines = rows.map((row) => JSON.stringify(row)).join('\n') + '\n'
          fs.appendFileSync(archivePath, lines, 'utf-8')
        }
        deleted += await this.logRepository.physicalRemoveByIds(ids)
        page += 1
      }
    }

    this.logger.log(`操作日志清理完成：共删除 ${deleted} 条，归档文件 ${archivePath}`)
    // 清理完成后自身留痕（保证删除动作可审计；失败不影响主流程）
    if (deleted > 0) {
      try {
        await this.recordLogAction(
          `操作日志清理：共删除 ${deleted} 条，归档文件 ${archivePath}`,
          OperationLogAction.DELETE,
          OperationLogLevel.WARN,
        )
      } catch (error) {
        this.logger.error('操作日志清理后留痕失败', error)
      }
    }
    return { dryRun: false, willDelete, deleted, archivedFile: archivePath }
  }

  /** 按默认保留策略执行一次清理（供定时任务每日调用） */
  async cleanByDefaultPolicy(): Promise<OperationLogCleanResult> {
    return this.cleanLogs({})
  }
}
