import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'

export interface JwtPayload {
  sub: string
  userName: string
  nickName: string
  roleCodes: string
  maxLevel: number
  permissions: string
}
declare module 'express' {
  interface Request {
    user?: CurrentLoginResponseDto
  }
}
