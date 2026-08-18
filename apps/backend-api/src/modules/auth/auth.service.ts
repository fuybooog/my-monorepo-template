import { Injectable } from '@nestjs/common'
import {
  CurrentLoginResponseDto,
  LoginResponseDto,
  PasswordLoginDto,
  PhoneLoginDto,
} from '@/modules/auth/auth.dto'
import type { Response } from 'express'
import { BusinessException } from '@/exceptions/business-exception'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from '@/utils/redis/redisService'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}
  async passwordLogin(loginDto: PasswordLoginDto, res: Response): Promise<LoginResponseDto> {
    if (loginDto.password !== '111111') {
      throw new BusinessException('账号或密码错误')
    }

    const user = {
      id: 'testId',
      userName: 'testName',
      roles: ['admin'],
    }
    const payload = {
      sub: user.id,
      userName: user.userName,
      roles: user.roles,
    }
    const jwtToken = this.jwtService.sign(payload)

    const redisKey = `auth:token:${user.id}`
    const EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000

    await this.redisService.set(redisKey, jwtToken, EXPIRE_TIME)

    res.cookie('access_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: EXPIRE_TIME,
      path: '/',
    })

    return user
  }
  async phoneLogin(loginDto: PhoneLoginDto, res: Response) {
    return {
      id: 'testId',
      name: 'testName',
    }
  }
  async logout(user: CurrentLoginResponseDto, res: Response) {
    if (user) {
      // 清除对应的redis
      const redisKey = `auth:token:${user.id}`
      await this.redisService.del(redisKey)
    }
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return null
  }
}
