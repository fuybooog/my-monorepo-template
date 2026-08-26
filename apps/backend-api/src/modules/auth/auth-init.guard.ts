import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthInitService } from '@/modules/auth/auth-init.service'

@Injectable()
export class AuthInitGuard implements CanActivate {
  constructor(private readonly authInitService: AuthInitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const clientIp = request.ip
    if (!clientIp) {
      throw new ForbiddenException('无法获取到ip地址，请检查网络配置')
    }
    const allowedIps = ['127.0.0.1', '::1', '192.168.', '::ffff:127.0.0.1']
    const isAllowed = allowedIps.some((prefix) => clientIp!.startsWith(prefix))
    if (!isAllowed) {
      throw new ForbiddenException('仅允许内网IP调用初始化接口')
    }
    const token = request.headers['x-init-token'] as string
    const isValid = this.authInitService.validateToken(token)
    if (!isValid) {
      throw new ForbiddenException('无效或已过期的一次性令牌')
    }
    return true
  }
}
