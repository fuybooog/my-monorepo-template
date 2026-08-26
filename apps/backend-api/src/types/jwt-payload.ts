import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'

export interface JwtPayload {
  sub: string
  userName: string
  nickName: string
  roleCodes: string
  permissions: string
}
declare module 'express' {
  interface Request {
    user?: CurrentLoginResponseDto
  }
}
