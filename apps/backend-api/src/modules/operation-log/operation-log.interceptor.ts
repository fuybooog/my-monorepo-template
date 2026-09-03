import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import {
  OperationLogActor,
  runWithOperationLogActor,
} from '@/modules/operation-log/operation-log.context'

/** AuthGuard 挂载到 request.user 的最小结构（与 auth.guard.ts 保持一致） */
interface AuthUser {
  id: number
  userName: string
  nickName?: string | null
}

/**
 * 全局请求上下文拦截器：
 * 将 request.user（由 AuthGuard 填充）与请求信息写入 AsyncLocalStorage，
 * 供 OperationLogService.record() 在业务层任意位置自动获取操作人。
 * 无登录态（登录接口本身、系统任务）不写入上下文，record 走显式 actor 兜底。
 */
@Injectable()
export class OperationLogContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>()
    const user = request.user

    if (!user || user.id == null) {
      return next.handle()
    }

    const actor: OperationLogActor = {
      userId: user.id,
      userName: user.userName ?? 'unknown',
      nickName: user.nickName ?? null,
      operatorIp: request.ip ?? null,
      requestUri: request.originalUrl ?? request.url ?? null,
      requestMethod: request.method ?? null,
    }

    return new Observable((subscriber) => {
      runWithOperationLogActor(actor, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        })
      })
    })
  }
}
