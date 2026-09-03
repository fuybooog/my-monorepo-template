import { AsyncLocalStorage } from 'node:async_hooks'

/**
 * 请求级操作人上下文（AsyncLocalStorage）。
 *
 * 由全局 OperationLogContextInterceptor 在每个 HTTP 请求进入时写入，
 * 业务 service 埋点 record() 时无需重复传操作人，自动从上下文取。
 * 设计目标：把"谁在操作"与业务代码解耦，埋点只关心"干了什么"。
 */
export interface OperationLogActor {
  userId: number
  userName: string
  nickName?: string | null
  operatorIp?: string | null
  requestUri?: string | null
  requestMethod?: string | null
}

const operationLogAls = new AsyncLocalStorage<OperationLogActor>()

/** 在指定 actor 上下文中执行 fn（供拦截器调用） */
export function runWithOperationLogActor<T>(actor: OperationLogActor, fn: () => T): T {
  return operationLogAls.run(actor, fn)
}

/** 获取当前请求操作人（无则 undefined，表示系统任务等场景） */
export function getCurrentOperationLogActor(): OperationLogActor | undefined {
  return operationLogAls.getStore()
}
