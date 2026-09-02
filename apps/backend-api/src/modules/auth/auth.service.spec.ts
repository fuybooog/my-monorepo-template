import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

// uuid@14 为 ESM-only 包，jest(CJS) 无法加载，mock 掉
jest.mock('uuid', () => ({ v4: () => 'uuid-1' }))

import { AuthService } from '@/modules/auth/auth.service'
import { RedisService } from '@/utils/redis/redisService'
import { UserService } from '@/modules/user/user.service'
import { RoleService } from '@/modules/role/role.service'
import { MailService } from '@/modules/mail/mail.service'
import { JwtPayload } from '@/types'
import type { Response } from 'express'

/** 构造一个有效的 refresh token payload */
const validPayload: JwtPayload = {
  sub: '1',
  userName: 'admin',
  nickName: '管理员',
  roleCodes: 'admin',
  maxLevel: 1,
  permissions: '*:*:*',
  type: 'refresh',
}

/** 正常用户（启用状态，带角色） */
const activeUser = {
  id: 1,
  userName: 'admin',
  nickName: '管理员',
  status: 1,
  roleIds: [1],
}

/** 角色列表返回结构（findRoleListByIds） */
const roleList = { list: [{ id: 1, roleCode: 'admin', level: 1 }] }

const mockRes = () => ({ cookie: jest.fn() }) as unknown as Response

describe('AuthService', () => {
  let service: AuthService
  let jwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verifyAsync'>>
  let redisService: jest.Mocked<Pick<RedisService, 'get' | 'set' | 'del'>>
  let userService: jest.Mocked<
    Pick<UserService, 'findUserById' | 'findUserWithPasswordByEmail' | 'updateUserPassword'>
  >
  let roleService: jest.Mocked<Pick<RoleService, 'findRoleListByIds' | 'getResourceIdsByRoleIds'>>
  let mailService: jest.Mocked<Pick<MailService, 'sendVerificationCode'>>
  let configService: { get: jest.Mock }

  beforeEach(() => {
    jwtService = {
      sign: jest.fn((payload: any) =>
        (payload as JwtPayload).type === 'refresh' ? 'refresh-token' : 'access-token',
      ),
      verifyAsync: jest.fn().mockResolvedValue(validPayload),
    }
    redisService = {
      get: jest.fn().mockResolvedValue('refresh-token'),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    }
    userService = {
      findUserById: jest.fn().mockResolvedValue(activeUser),
      findUserWithPasswordByEmail: jest.fn().mockResolvedValue({
        ...activeUser,
        email: 'admin@example.com',
        password: null,
      }),
      updateUserPassword: jest.fn().mockResolvedValue(undefined),
    }
    roleService = {
      findRoleListByIds: jest.fn().mockResolvedValue(roleList),
      getResourceIdsByRoleIds: jest.fn().mockResolvedValue(['*:*:*']),
    }
    mailService = {
      sendVerificationCode: jest.fn().mockResolvedValue(undefined),
    }
    configService = { get: jest.fn().mockReturnValue(undefined) }

    service = new AuthService(
      jwtService as any,
      redisService as any,
      userService as any,
      roleService as any,
      {} as any,
      configService as any,
      mailService as any,
    )
  })

  describe('refresh', () => {
    it('缺少 refresh token 时拒绝', async () => {
      await expect(service.refresh('', mockRes())).rejects.toThrow(UnauthorizedException)
      expect(userService.findUserById).not.toHaveBeenCalled()
    })

    it('token 校验失败（无效/过期）时拒绝', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'))
      await expect(service.refresh('bad-token', mockRes())).rejects.toThrow(UnauthorizedException)
    })

    it('access token 冒用 refresh 接口时拒绝（type 非 refresh）', async () => {
      jwtService.verifyAsync.mockResolvedValue({ ...validPayload, type: undefined })
      await expect(service.refresh('access-token', mockRes())).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('Redis 中无会话记录时拒绝（已登出/被踢下线）', async () => {
      redisService.get.mockResolvedValue(null)
      await expect(service.refresh('refresh-token', mockRes())).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('Redis 中的 token 与当前不一致时拒绝（旧 token）', async () => {
      redisService.get.mockResolvedValue('newer-refresh-token')
      await expect(service.refresh('refresh-token', mockRes())).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('用户已被删除时拒绝', async () => {
      userService.findUserById.mockRejectedValue(new NotFoundException('用户不存在'))
      await expect(service.refresh('refresh-token', mockRes())).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('用户已被禁用时拒绝', async () => {
      userService.findUserById.mockResolvedValue({ ...activeUser, status: 0 })
      await expect(service.refresh('refresh-token', mockRes())).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('校验通过后重新签发双 token、写 Redis 并种 cookie', async () => {
      const res = mockRes()
      const result = await service.refresh('refresh-token', res)

      // 返回登录信息
      expect(result).toEqual({
        roleCodes: ['admin'],
        id: 1,
        userName: 'admin',
        nickName: '管理员',
      })

      // 签发了 access + refresh 两个 token（access 的 payload 不含 type 字段）
      expect(jwtService.sign).toHaveBeenCalledTimes(2)
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: '1', roleCodes: 'admin' }),
        {
          expiresIn: 30 * 60,
        },
      )
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ type: 'refresh' }), {
        expiresIn: 7 * 24 * 60 * 60,
      })

      // Redis 写入 access + refresh
      expect(redisService.set).toHaveBeenNthCalledWith(1, 'auth:token:1', 'access-token', 30 * 60)
      expect(redisService.set).toHaveBeenNthCalledWith(
        2,
        'auth:refresh:1',
        'refresh-token',
        7 * 24 * 60 * 60,
      )

      // 种下两个 cookie
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'access-token',
        expect.objectContaining({ maxAge: 30 * 60 * 1000 }),
      )
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
      )
    })

    it('刷新时重新构建角色与权限 payload（权限变更即时生效）', async () => {
      // 非 admin 角色：走角色资源查询分支，验证权限码随角色变更
      roleService.findRoleListByIds.mockResolvedValue({
        list: [
          { id: 1, roleCode: 'operator', level: 3 },
          { id: 2, roleCode: 'viewer', level: 5 },
        ],
      })
      roleService.getResourceIdsByRoleIds.mockResolvedValue(['user:list', 'user:detail'])
      await service.refresh('refresh-token', mockRes())

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ roleCodes: 'operator,viewer', maxLevel: 5 }),
        expect.anything(),
      )
      expect(roleService.getResourceIdsByRoleIds).toHaveBeenCalledWith([1])
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ permissions: 'user:list,user:detail' }),
        expect.anything(),
      )
    })
  })

  describe('logout', () => {
    it('清理 access/refresh 两个 Redis key 并清空两个 cookie', async () => {
      const res = mockRes()
      await service.logout({ id: 1 } as any, res)

      expect(redisService.del).toHaveBeenCalledTimes(2)
      expect(redisService.del).toHaveBeenCalledWith('auth:token:1')
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:1')

      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      )
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      )
    })

    it('无用户信息时仅清空 cookie 不报错', async () => {
      const res = mockRes()
      await expect(service.logout(null as any, res)).resolves.toBeNull()
      expect(redisService.del).not.toHaveBeenCalled()
      expect(res.cookie).toHaveBeenCalledTimes(2)
    })
  })

  describe('forgotPassword', () => {
    /** httpClient 请求头（dev 环境判断依据） */
    const devReq = { headers: { 'x-req-method': 'httpClient' } } as any
    const prodReq = { headers: {} } as any

    it('账号存在时写入 6 位验证码（10 分钟 TTL）并真实发送邮件，非 dev 环境不返回验证码', async () => {
      const result = await service.forgotPassword({ email: 'admin@example.com' }, prodReq)

      expect(userService.findUserWithPasswordByEmail).toHaveBeenCalledWith('admin@example.com')
      expect(redisService.set).toHaveBeenCalledWith(
        'auth:forgot:code:admin@example.com',
        expect.stringMatching(/^\d{6}$/),
        10 * 60,
      )
      // 账号存在：发送验证码邮件（与 Redis 中为同一验证码）
      const storedCode = redisService.set.mock.calls[0][1] as string
      expect(mailService.sendVerificationCode).toHaveBeenCalledWith('admin@example.com', storedCode)
      // 防止邮箱枚举：生产环境不返回验证码
      expect(result).toEqual({})
    })

    it('账号不存在时写入占位验证码、不发送邮件并同样返回成功（防枚举）', async () => {
      userService.findUserWithPasswordByEmail.mockResolvedValue(null)
      const result = await service.forgotPassword({ email: 'ghost@example.com' }, prodReq)

      expect(redisService.set).toHaveBeenCalledWith(
        'auth:forgot:code:ghost@example.com',
        '000000',
        10 * 60,
      )
      expect(mailService.sendVerificationCode).not.toHaveBeenCalled()
      expect(result).toEqual({})
    })

    it('邮件发送失败时不向上抛出，接口仍返回成功（防枚举一致性）', async () => {
      mailService.sendVerificationCode.mockRejectedValue(new Error('SMTP connect failed'))
      await expect(
        service.forgotPassword({ email: 'admin@example.com' }, prodReq),
      ).resolves.toEqual({})
      // 验证码仍写入 Redis，保证响应一致
      expect(redisService.set).toHaveBeenCalledWith(
        'auth:forgot:code:admin@example.com',
        expect.stringMatching(/^\d{6}$/),
        10 * 60,
      )
    })

    it('邮件为异步发送，不阻塞接口响应（SMTP 慢时接口仍秒回）', async () => {
      // 让发送永不完成：若实现改为同步等待发送，此用例会超时失败
      let resolveSend!: () => void
      mailService.sendVerificationCode.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSend = resolve
        }),
      )
      const promise = service.forgotPassword({ email: 'admin@example.com' }, prodReq)
      await expect(promise).resolves.toEqual({})
      // 清理悬挂的 Promise，避免影响测试进程退出
      resolveSend()
    })

    it('dev 环境（httpClient）回显验证码便于联调', async () => {
      configService.get.mockReturnValue('development')
      const result = await service.forgotPassword({ email: 'admin@example.com' }, devReq)

      expect(result.devCode).toMatch(/^\d{6}$/)
    })
  })

  describe('forgotResetPassword', () => {
    const devReq = { headers: { 'x-req-method': 'httpClient' } } as any

    it('验证码错误时拒绝', async () => {
      redisService.get.mockResolvedValue('123456')
      await expect(
        service.forgotResetPassword(
          { email: 'admin@example.com', code: '000000', newPassword: 'new-pass' },
          devReq,
        ),
      ).rejects.toThrow(UnauthorizedException)
      // 一次性凭证：无论成败都销毁
      expect(redisService.del).toHaveBeenCalledWith('auth:forgot:code:admin@example.com')
    })

    it('验证码已过期（Redis 无记录）时拒绝', async () => {
      redisService.get.mockResolvedValue(null)
      await expect(
        service.forgotResetPassword(
          { email: 'admin@example.com', code: '123456', newPassword: 'new-pass' },
          devReq,
        ),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('账号不存在时拒绝', async () => {
      redisService.get.mockResolvedValue('123456')
      userService.findUserWithPasswordByEmail.mockResolvedValue(null)
      await expect(
        service.forgotResetPassword(
          { email: 'ghost@example.com', code: '123456', newPassword: 'new-pass' },
          devReq,
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('dev 环境直传明文，重置密码并踢掉旧会话', async () => {
      configService.get.mockReturnValue('development')
      redisService.get.mockResolvedValue('123456')

      await service.forgotResetPassword(
        { email: 'admin@example.com', code: '123456', newPassword: 'new-pass-123' },
        devReq,
      )

      // 密码被 hash 后更新
      const [userId, passwordHash] = userService.updateUserPassword.mock.calls[0]
      expect(userId).toBe(1)
      expect(passwordHash).not.toBe('new-pass-123')
      expect(passwordHash).toMatch(/^\$2[aby]\$/)

      // 清空该用户所有登录会话
      expect(redisService.del).toHaveBeenCalledWith('auth:token:1')
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:1')
    })

    it('非 dev 环境必须携带 keyId，解密后重置密码', async () => {
      redisService.get.mockResolvedValue('123456')
      const prodReq = { headers: {} } as any

      await expect(
        service.forgotResetPassword(
          { email: 'admin@example.com', code: '123456', newPassword: 'encrypted' },
          prodReq,
        ),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('解密后的明文密码不满足 6-32 位长度要求时拒绝（密文长度校验在明文上进行）', async () => {
      configService.get.mockReturnValue('development')
      redisService.get.mockResolvedValue('123456')

      await expect(
        service.forgotResetPassword(
          { email: 'admin@example.com', code: '123456', newPassword: '123' },
          devReq,
        ),
      ).rejects.toThrow(BadRequestException)
      // 未执行密码更新
      expect(userService.updateUserPassword).not.toHaveBeenCalled()
    })
  })
})
