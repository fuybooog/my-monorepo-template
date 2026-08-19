import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { IS_PUBLIC_KEY } from '@/decorators/public.decorator'
import { ConfigService } from '@nestjs/config'
import type { JwtPayload } from '@/types'
import { RedisService } from '@/utils/redis/redisService'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<Request>()
    const token = request.cookies?.['access_token']

    if (!token) {
      throw new UnauthorizedException('您尚未登录，请先登录')
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      })

      const redisKey = `auth:token:${payload.sub}`
      let redisToken: string | null = null
      let redisFlag = true
      try {
        redisToken = await Promise.race([
          this.redisService.get(redisKey),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
        ])
      } catch (_err) {
        redisFlag = false
        const logger = new Logger('AuthGuard')
        logger.warn(`Redis 服务不可用，安全守卫已自动降级为【纯 JWT 校验模式】`)
      }

      if (redisFlag && (!redisToken || redisToken !== token)) {
        throw new UnauthorizedException('登录状态无效！')
      }

      const permissions = ['sys:user-list:delete', 'sys:user-list:edit', 'sys:role-list:edit']

      request.user = {
        id: Number(payload.sub),
        userName: payload.userName,
        roles: payload.roles,
        permissions,
      }

      return true
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('登录状态已过期，请重新登录')
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('非法的登录凭证，拒绝访问')
      }
      throw new UnauthorizedException('认证失败')
    }
  }
}
