import { timingSafeEqual } from 'crypto'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { CSRF_SKIP_KEY } from './csrf.decorator'
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_SAFE_METHODS,
  securityConfig,
} from './security.constants'

/** 定长比较，避免通过响应时间差逐字节爆破令牌 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/**
 * CSRF 守卫（全局）。
 *
 * 校验范围刻意收窄，避免误伤：
 * - 安全方法（GET/HEAD/OPTIONS）不产生状态变更，跳过；
 * - 带 Authorization 请求头的调用方（原生 App / 服务端脚本）凭据由代码显式携带，
 *   浏览器不会自动附加，不存在 CSRF 面，跳过；
 * - 未下发过 CSRF Cookie 的请求（首次访问的服务端调用）无可滥用的 Cookie 凭据，跳过。
 *
 * 其余「携带 Cookie 凭据的状态变更请求」必须回传与 Cookie 一致的 X-CSRF-Token。
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!securityConfig.csrfEnabled) {
      return true
    }

    if (context.getType() !== 'http') {
      return true
    }

    const req = context.switchToHttp().getRequest<Request>()

    if (CSRF_SAFE_METHODS.has((req.method || '').toUpperCase())) {
      return true
    }

    const skip = this.reflector.getAllAndOverride<boolean>(CSRF_SKIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (skip) {
      return true
    }

    if (req.headers?.authorization) {
      return true
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME] as string | undefined
    if (!cookieToken) {
      return true
    }

    const headerToken = req.headers?.[CSRF_HEADER_NAME] as string | undefined
    if (!headerToken || !safeEqual(headerToken, cookieToken)) {
      throw new ForbiddenException('请求校验失败，请刷新页面后重试')
    }

    return true
  }
}
