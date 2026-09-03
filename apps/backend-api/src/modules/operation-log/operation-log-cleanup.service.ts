import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import dayjs from 'dayjs'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'

/**
 * 操作日志定时清理调度器。
 *
 * 默认每天在 LOG_CLEAN_TIME（默认 03:30）执行一次按保留策略清理：
 * INFO 180 天 / WARN 365 天 / ERROR 730 天（均可通过环境变量覆盖：
 * LOG_CLEAN_KEEP_DAYS_INFO / LOG_CLEAN_KEEP_DAYS_WARN / LOG_CLEAN_KEEP_DAYS_ERROR）。
 * 设置 LOG_CLEAN_ENABLED=false 可关闭定时清理（仍可手动调用 /operation-log/clean）。
 */
@Injectable()
export class OperationLogCleanupService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OperationLogCleanupService.name)
  private timer?: NodeJS.Timeout
  private readonly enabled: boolean
  private readonly cleanTime: string

  constructor(private readonly operationLogService: OperationLogService) {
    this.enabled = process.env.LOG_CLEAN_ENABLED !== 'false'
    this.cleanTime = process.env.LOG_CLEAN_TIME || '03:30'
  }

  onApplicationBootstrap() {
    if (!this.enabled) {
      this.logger.warn('操作日志定时清理已关闭（LOG_CLEAN_ENABLED=false），仅保留手动清理入口')
      return
    }
    const delay = this.millisUntilNextRun()
    this.logger.log(
      `操作日志定时清理已启用，下一次执行约在 ${dayjs().add(delay, 'ms').format('YYYY-MM-DD HH:mm:ss')}`,
    )

    this.timer = setTimeout(() => {
      void this.runOnce()
      // 之后每 24 小时执行
      this.timer = setInterval(() => void this.runOnce(), 24 * 60 * 60 * 1000)
    }, delay)
    this.timer.unref?.()
  }

  onModuleDestroy() {
    if (this.timer) {
      clearTimeout(this.timer)
      clearInterval(this.timer)
    }
  }

  private async runOnce() {
    try {
      const result = await this.operationLogService.cleanByDefaultPolicy()
      this.logger.log(
        `定时清理完成：本次命中 ${result.willDelete} 条，删除 ${result.deleted} 条` +
          (result.archivedFile ? `，归档：${result.archivedFile}` : ''),
      )
    } catch (error) {
      this.logger.error(
        '定时清理操作日志失败',
        error instanceof Error ? error.stack : String(error),
      )
    }
  }

  /** 距下一个 LOG_CLEAN_TIME（如 03:30）的毫秒数 */
  private millisUntilNextRun(): number {
    const [hour, minute] = this.cleanTime.split(':').map((part) => Number(part) || 0)
    const now = dayjs()
    let next = now.hour(hour).minute(minute).second(0).millisecond(0)
    if (next.isBefore(now)) {
      next = next.add(1, 'day')
    }
    return next.diff(now, 'ms')
  }
}
