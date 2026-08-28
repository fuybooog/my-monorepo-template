import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '@/decorators/require-permissions.decorator'
import { ADMIN_ROLE_CODE } from '@/constants'
import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user: CurrentLoginResponseDto = request.user

    if (!user) {
      throw new ForbiddenException('未认证用户')
    }

    // 1. 检查超级管理员
    if (user.roleCodes?.includes(ADMIN_ROLE_CODE)) {
      return true
    }

    // 2. 检查用户是否拥有任意一个所需权限
    const userPermissions = user.permissions || []
    const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm))

    if (!hasPermission) {
      throw new ForbiddenException('权限不足')
    }

    return true
  }
}
