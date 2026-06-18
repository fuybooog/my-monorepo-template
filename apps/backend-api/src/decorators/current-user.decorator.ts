import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): CurrentLoginResponseDto => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
