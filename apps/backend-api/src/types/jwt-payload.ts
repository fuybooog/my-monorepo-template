import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'

export interface JwtPayload {
  sub: string
  userName: string
  roles: string[]
}
declare module 'express' {
  interface Request {
    user?: CurrentLoginResponseDto
  }
}
