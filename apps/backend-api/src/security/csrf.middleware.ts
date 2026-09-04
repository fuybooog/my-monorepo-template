import { randomUUID } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { CSRF_COOKIE_NAME, CSRF_COOKIE_MAX_AGE, securityConfig } from './security.constants'

/**
 * 下发 CSRF 令牌 Cookie（双提交 Cookie 模式）。
 *
 * 令牌本身不是机密（故意设为非 httpOnly，供前端 JS 读取后回放到 X-CSRF-Token 请求头），
 * 安全性来自「跨站脚本无法读取目标站 Cookie，因而无法在请求头中回放出同一个值」。
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!securityConfig.csrfEnabled) {
    return next()
  }

  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    res.cookie(CSRF_COOKIE_NAME, randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: CSRF_COOKIE_MAX_AGE,
    })
  }

  next()
}
