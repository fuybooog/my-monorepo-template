import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import bcrypt from 'bcrypt'
import forge from 'node-forge'
import { jest } from '@jest/globals'
import { User } from '@/modules/user/entities/user.entity'
import { OperationLog } from '@/modules/operation-log/entities/operation-log.entity'
import { RedisService } from '@/utils/redis/redisService'
import { AuthGuard } from '@/modules/auth/auth.guard'
import { createTestApp } from '../../../../test/test-util'

const TEST_USER_NAME = 'e2e_auth_admin'
const PLAIN_PASSWORD = 'E2e@Pass123'

describe('AuthController(E2E) 登录/登出真链路', () => {
  let app: INestApplication
  let dataSource: DataSource
  let redisService: RedisService
  let agent: ReturnType<typeof request.agent>
  let adminId: number

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 还原 @Public 语义：login/logout 不注入登录态，
    // 否则 logout 的 @CurrentUser 会拿到 createTestApp mock 的 test_user_1 而非真实登录人
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context) => {
      context.switchToHttp().getRequest().user = undefined
      return true
    })

    redisService = app.get<RedisService>(RedisService)
    agent = request.agent(app.getHttpServer())

    // 准备可登录账号：只删除同名残留再插入，不清全表（避免影响串行队列中其它 spec 的数据）
    const userRepository = dataSource.getRepository(User)
    await userRepository.delete({ userName: TEST_USER_NAME })
    const user = await userRepository.save({
      userName: TEST_USER_NAME,
      nickName: '端到端登录用户',
      password: bcrypt.hashSync(PLAIN_PASSWORD, 10),
      status: 1,
    })
    adminId = user.id
  })

  afterAll(async () => {
    // 清理测试账号与本 spec 产生的 auth 日志，保持测试库干净
    const userRepository = dataSource.getRepository(User)
    await userRepository.delete({ userName: TEST_USER_NAME })
    const logRepository = dataSource.getRepository(OperationLog)
    await logRepository.delete({ module: 'auth', operatorId: adminId })
    await dataSource.destroy()
    await app.close()
  })

  it('公钥 + 图形验证码 + RSA 加密密码 → 登录成功并写 LOGIN 日志', async () => {
    // 1. 获取 RSA 公钥
    const pkRes = await agent.get('/api/auth/publicKey').expect(200)
    const { keyId, publicKey } = pkRes.body.data as { keyId: string; publicKey: string }
    expect(keyId).toBeTruthy()
    expect(publicKey).toContain('BEGIN PUBLIC KEY')

    // 2. 获取图形验证码，并从 Redis 直读答案（模拟"人眼看图"输入）
    const captchaRes = await agent.get('/api/auth/captcha').expect(200)
    const { captchaKey } = captchaRes.body.data as { captchaKey: string }
    expect(captchaKey).toBeTruthy()
    const realCode = await redisService.get(`auth:captcha:${captchaKey}`)
    expect(realCode).toBeTruthy()

    // 3. 用公钥按 RSAES-PKCS1-V1_5 加密明文密码（与 HelperService.decryptPassword 算法一致）
    // 注意：node-forge publicKey.encrypt 返回的是二进制密文字节串（非 hex），直接 base64 即可
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)
    const encryptedBytes = publicKeyObj.encrypt(
      forge.util.encodeUtf8(PLAIN_PASSWORD),
      'RSAES-PKCS1-V1_5',
    )
    const password = forge.util.encode64(encryptedBytes)

    // 4. 携带 captcha + 加密密码登录
    const loginRes = await agent.post('/api/auth/passwordLogin').send({
      userName: TEST_USER_NAME,
      password,
      captchaKey,
      captchaCode: realCode,
      keyId,
    })
    expect(loginRes.status).toBe(201)

    const { head, data } = loginRes.body as {
      head: { errCode: number }
      data: { id: number; userName: string }
    }
    expect(head.errCode).toBe(0)
    expect(data).toMatchObject({ userName: TEST_USER_NAME, id: adminId })
    const setCookie = (loginRes.headers['set-cookie'] as string[] | undefined) ?? []
    expect(setCookie.some((c) => c.startsWith('access_token='))).toBe(true)

    // 5. 私钥为一次性凭证：解密后 Redis 中应已删除
    expect(await redisService.get(`auth:rsa:pair:${keyId}`)).toBeNull()

    // 6. 会话已写入 Redis
    expect(await redisService.get(`auth:token:${adminId}`)).toBeTruthy()

    // 7. LOGIN 日志落库，操作人应为真实登录用户
    const logRepository = dataSource.getRepository(OperationLog)
    const logs = await logRepository.find({
      where: { module: 'auth', operationType: 'LOGIN', operatorId: adminId },
      order: { id: 'DESC' },
      take: 1,
    })
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      operatorName: TEST_USER_NAME,
      operationText: '登录',
      moduleText: '认证管理',
    })
    expect(logs[0].businessText).toContain(String(adminId))
  })

  it('携带会话 Cookie 退出登录 → 写 LOGOUT 日志', async () => {
    const res = await agent.post('/api/auth/logout').expect(201)
    const { head } = res.body as { head: { errCode: number } }
    expect(head.errCode).toBe(0)

    // 操作人来自 cookie 中 access_token 解码（@Public 接口无登录态时的兜底路径）
    const logRepository = dataSource.getRepository(OperationLog)
    const logs = await logRepository.find({
      where: { module: 'auth', operationType: 'LOGOUT', operatorId: adminId },
      order: { id: 'DESC' },
      take: 1,
    })
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      operatorName: TEST_USER_NAME,
      operationText: '退出登录',
      moduleText: '认证管理',
    })
  })
})
