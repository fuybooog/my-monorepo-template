import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import dayjs from 'dayjs'
import { OperationLog } from '@/modules/operation-log/entities/operation-log.entity'
import { OperationLogPageDto } from '@/modules/operation-log/dto/operation-log.page.dto'
import { OperationLogQueryDto } from '@/modules/operation-log/dto/operation-log.query.dto'

/** '2024-01-01' -> 当日 00:00:00；'2024-01-01 08:00:00' 原样返回 */
function toStartOfRange(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? dayjs(value).format('YYYY-MM-DD 00:00:00') : value
}

/** '2024-01-01' -> 当日 23:59:59；'2024-01-01 08:00:00' 原样返回 */
function toEndOfRange(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? dayjs(value).format('YYYY-MM-DD 23:59:59') : value
}

/** 构建日志筛选的通用查询构建器（列表分页与导出全量共用） */
function buildQuery(
  qb: import('typeorm').SelectQueryBuilder<OperationLog>,
  query: OperationLogQueryDto,
) {
  const { module, operationType, logLevel, operatorName, keyword, createdStart, createdEnd } = query

  if (module) {
    qb.andWhere('log.module = :module', { module })
  }
  if (operationType) {
    qb.andWhere('log.operationType = :operationType', { operationType })
  }
  if (logLevel) {
    qb.andWhere('log.logLevel = :logLevel', { logLevel })
  }
  if (operatorName) {
    qb.andWhere('log.operatorName LIKE :operatorName', { operatorName: `%${operatorName}%` })
  }
  if (keyword) {
    qb.andWhere('log.businessText LIKE :keyword', { keyword: `%${keyword}%` })
  }
  if (createdStart) {
    qb.andWhere('log.createdAt >= :createdStart', { createdStart: toStartOfRange(createdStart) })
  }
  if (createdEnd) {
    qb.andWhere('log.createdAt <= :createdEnd', { createdEnd: toEndOfRange(createdEnd) })
  }
  return qb
}

@Injectable()
export class OperationLogRepository extends Repository<OperationLog> {
  constructor(private dataSource: DataSource) {
    super(OperationLog, dataSource.createEntityManager())
  }

  /** 分页查询操作日志 */
  async searchLogsByPage(query: OperationLogPageDto) {
    const { page = 1, pageSize = 10 } = query

    const qb = this.createQueryBuilder('log')
    buildQuery(qb, query)
    qb.orderBy('log.createdAt', 'DESC').addOrderBy('log.id', 'DESC')
    qb.skip((page - 1) * pageSize).take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  /** 导出用：按相同筛选条件一次性查询（不分页，上限保护由调用方控制） */
  async searchLogsForExport(query: OperationLogQueryDto) {
    const qb = this.createQueryBuilder('log')
    buildQuery(qb, query)
    qb.orderBy('log.createdAt', 'ASC').addOrderBy('log.id', 'ASC')
    return await qb.getMany()
  }

  /**
   * 按清理条件分页取出待删除日志的 id。
   * @param before 删除 createdAt 严格早于该时刻（'YYYY-MM-DD HH:mm:ss'）的日志
   * @param logLevel 可选级别过滤
   */
  async findExpiredIds(before: string, logLevel?: number, page = 1, pageSize = 1000) {
    const qb = this.createQueryBuilder('log')
      .select('log.id', 'id')
      .where('log.createdAt < :before', { before })
    if (logLevel) {
      qb.andWhere('log.logLevel = :logLevel', { logLevel })
    }
    qb.orderBy('log.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
    const rows = await qb.getRawMany<{ id: number }>()
    return rows.map((row) => Number(row.id))
  }

  /** 统计满足清理条件的日志总数 */
  async countExpired(before: string, logLevel?: number): Promise<number> {
    const qb = this.createQueryBuilder('log').where('log.createdAt < :before', { before })
    if (logLevel) {
      qb.andWhere('log.logLevel = :logLevel', { logLevel })
    }
    return await qb.getCount()
  }

  /** 按 id 批量取完整日志（供清理前归档） */
  async findByIds(ids: number[]): Promise<OperationLog[]> {
    if (ids.length === 0) return []
    const qb = this.createQueryBuilder('log').where('log.id IN (:...ids)', { ids })
    return await qb.getMany()
  }

  /** 物理删除（日志表不软删除，清理即归档后物理删除） */
  async physicalRemoveByIds(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0
    const result = await this.createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids })
      .execute()
    return result.affected ?? 0
  }
}
