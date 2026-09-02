import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import {
  CurrentLoginResponseDto,
  ForgotPasswordDto,
  ForgotPasswordResetDto,
  ForgotPasswordRespDto,
  LoginResponseDto,
  PasswordLoginDto,
  PhoneLoginDto,
} from '@/modules/auth/auth.dto'
import type { Response, Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from '@/utils/redis/redisService'
import forge from 'node-forge'
import svgCaptcha from 'svg-captcha'
import { v4 as uuidv4 } from 'uuid'
import { UserService } from '@/modules/user/user.service'
import { UserRespDto } from '@/modules/user/dto/user.resp.dto'
import bcrypt from 'bcrypt'
import { RoleService } from '@/modules/role/role.service'
import { JwtPayload } from '@/types'
import { HelperService } from '@/modules/shared/helper.service'
import { ConfigService } from '@nestjs/config'
import { BaseStatusEnum } from '@/enum/base-status.enum'
import { MailService } from '@/modules/mail/mail.service'

const DUMMY_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s5gG73aG2W2O2'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly CAPTCHA_PREFIX = 'auth:captcha:'
  private readonly CAPTCHA_EXPIRE = 180
  private readonly KEY_PREFIX = 'auth:rsa:pair:'
  private readonly KEY_EXPIRE_SECONDS = 600

  /** access token 有效期（秒）：30 分钟 */
  private readonly ACCESS_TOKEN_EXPIRE = 30 * 60
  /** refresh token 有效期（秒）：7 天 */
  private readonly REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60
  /** 找回密码邮箱验证码前缀 */
  private readonly FORGOT_CODE_PREFIX = 'auth:forgot:code:'
  /** 找回密码邮箱验证码有效期（秒）：10 分钟 */
  private readonly FORGOT_CODE_EXPIRE = 10 * 60

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly helperService: HelperService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validatePassword(rawPassword: string, dbHashPassword?: string) {
    const isPasswordValid = await bcrypt.compare(rawPassword, dbHashPassword || DUMMY_HASH)

    return isPasswordValid
  }
  async getPublicKey() {
    const keyId = uuidv4()
    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 })
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey)
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)

    // 存入 Redis，10 分钟后自动关毁
    await this.redisService.set(
      `${this.KEY_PREFIX}${keyId}`,
      privateKeyPem,
      this.KEY_EXPIRE_SECONDS,
    )

    return {
      keyId, // 前端登录时需同时带上这个 keyId
      publicKey: publicKeyPem,
    }
  }

  /**
   * 生成图形验证码
   */
  async createCaptcha() {
    // 1. 配置并生成 svg 验证码
    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      // ignoreChars: '0o1iI1lL', // 排除容易混淆的字符
      charPreset: 'ABCEFGHKMNRSTWX3456789',
      noise: 2, // 干扰线条数量
      color: true, // 彩色背景/文字
      background: '#f4f6f8', // 背景颜色
      width: 120,
      height: 40,
    })

    // 2. 生成唯一的 Key
    const captchaKey = uuidv4()

    // 3. 将答案转为小写存入 Redis，设置过期时间
    await this.redisService.set(
      `${this.CAPTCHA_PREFIX}${captchaKey}`,
      captcha.text.toLowerCase(),
      this.CAPTCHA_EXPIRE,
    )

    // 4. 返回 Key 和用于前端渲染的 Data URL 格式或 SVG 字符串
    return {
      captchaKey,
      // 直接拼接为标准的 Data URL，前端 <img :src="captchaImg" /> 即可渲染
      captchaImg: `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`,
    }
  }

  /**
   * 校验图形验证码
   */
  async validateCaptcha(captchaKey: string, inputCode: string): Promise<boolean> {
    if (!captchaKey || !inputCode) {
      throw new UnauthorizedException('请输入验证码')
    }

    const redisKey = `${this.CAPTCHA_PREFIX}${captchaKey}`
    const realCode = await this.redisService.get(redisKey)

    // 无论验证是否成功，获取后立即销毁 Key（一次性凭证，防止暴力破解）
    if (realCode) {
      await this.redisService.del(redisKey)
    } else {
      throw new UnauthorizedException('验证码已过期或不存在，请刷新')
    }

    // 忽略大小写比对
    if (realCode !== inputCode.trim().toLowerCase()) {
      throw new UnauthorizedException('验证码错误')
    }

    return true
  }
  async passwordLogin(
    loginDto: PasswordLoginDto,
    res: Response,
    req: Request,
  ): Promise<LoginResponseDto> {
    const isHttpClient = req.headers['x-req-method'] === 'httpClient'
    const isDev = this.configService.get('NODE_ENV') === 'development' && isHttpClient
    const { userName, password, captchaKey, captchaCode, keyId } = loginDto

    if (!isDev) {
      if (!captchaKey || !captchaCode) {
        throw new UnauthorizedException('验证码错误')
      }
      const valid = await this.validateCaptcha(captchaKey, captchaCode)

      if (!valid) {
        throw new UnauthorizedException('验证码错误')
      }
    }

    let decrypted
    if (isDev) {
      decrypted = password
    } else {
      if (!keyId) {
        throw new UnauthorizedException('验证不通过')
      }
      decrypted = await this.helperService.decryptPassword(password, keyId)
    }

    const user = await this.userService.findUserWithPasswordByUserName(userName)

    const exist = !!user

    const pw = exist ? user.password : ''

    const isPasswordValid = await this.validatePassword(decrypted, pw || '')
    console.log('校验密码：', isPasswordValid, decrypted, pw)
    if (!exist || !isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    if (user.status === BaseStatusEnum.DISABLE) {
      throw new UnauthorizedException('用户已被禁用')
    }

    const { roleCodes } = await this.issueTokenPair(user, res)

    return {
      roleCodes,
      id: user!.id as number,
      userName: user!.userName as string,
      nickName: user!.nickName as string,
    }
  }

  /**
   * 构建 JWT payload（登录与刷新复用，保证角色/权限变更及时生效）
   */
  private async buildAuthPayload(user: {
    id?: number
    userName?: string
    nickName?: string | null
    roleIds?: number[]
  }): Promise<JwtPayload> {
    let roleCodes: string[] = []
    let maxLevel: number = 0
    if (user.roleIds && user.roleIds.length > 0) {
      const roleListRel = await this.roleService.findRoleListByIds(user.roleIds.join())
      roleCodes = roleListRel?.list?.map((role) => role.roleCode!) || []
      maxLevel = Math.max(...(roleListRel?.list?.map((role) => role.level || 0) || [0]))
    }
    let permissions: string[] = []
    if (roleCodes.length > 0 && roleCodes.includes('admin')) {
      permissions = ['*:*:*']
    } else if (roleCodes.length > 0) {
      // 根据角色代码获取对应的权限
      permissions = await this.roleService.getResourceIdsByRoleIds(user.roleIds!)
    }

    return {
      sub: String(user.id!),
      userName: user.userName!,
      nickName: user.nickName!,
      roleCodes: roleCodes.join(),
      maxLevel,
      permissions: permissions.join(),
    }
  }

  /**
   * 签发 access + refresh 双 Token：写入 Redis（仅最新 token 有效，保持单点登录语义）并种下 Cookie
   */
  private async issueTokenPair(
    user: { id?: number; userName?: string; nickName?: string | null; roleIds?: number[] },
    res: Response,
  ): Promise<{ roleCodes: string[] }> {
    const payload = await this.buildAuthPayload(user)
    const roleCodes = payload.roleCodes.split(',').filter(Boolean)

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRE,
    })
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_EXPIRE },
    )

    await this.redisService.set(`auth:token:${user.id}`, accessToken, this.ACCESS_TOKEN_EXPIRE)
    await this.redisService.set(`auth:refresh:${user.id}`, refreshToken, this.REFRESH_TOKEN_EXPIRE)

    const secure = process.env.NODE_ENV === 'production'
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: this.ACCESS_TOKEN_EXPIRE * 1000,
      path: '/',
    })
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: this.REFRESH_TOKEN_EXPIRE * 1000,
      path: '/',
    })

    return { roleCodes }
  }

  /**
   * 刷新令牌：校验 refresh token 有效性后重新签发双 Token
   */
  async refresh(refreshToken: string, res: Response): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('登录状态已过期，请重新登录')
    }

    let payload: JwtPayload
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken)
    } catch {
      throw new UnauthorizedException('登录状态已过期，请重新登录')
    }

    // 仅 refresh token 允许调用刷新接口，防止 access token 冒用
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('登录状态已过期，请重新登录')
    }

    const userId = Number(payload.sub)

    // Redis 校验：仅最新签发的 refresh token 有效（复用单点登录/踢下线语义）
    // 注意：key 不存在（已登出/被踢下线）同样视为失效，严格拒绝
    const redisRefresh = await this.redisService.get(`auth:refresh:${userId}`)
    if (redisRefresh !== refreshToken) {
      throw new UnauthorizedException('登录状态已过期，请重新登录')
    }

    let user: UserRespDto | null = null
    try {
      user = await this.userService.findUserById(userId)
    } catch (error) {
      // 用户已被删除：刷新语义上等同登录失效
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('登录状态已过期，请重新登录')
      }
      throw error
    }
    if (!user) {
      throw new UnauthorizedException('登录状态已过期，请重新登录')
    }
    if (user.status === BaseStatusEnum.DISABLE) {
      throw new UnauthorizedException('用户已被禁用')
    }

    // 重新构建 payload 签发新 Token（角色/权限变更即时生效）
    const { roleCodes } = await this.issueTokenPair(user, res)

    return {
      roleCodes,
      id: user.id as number,
      userName: user.userName as string,
      nickName: user.nickName as string,
    }
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
      await this.redisService.del(`auth:refresh:${user.id}`)
    }
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return null
  }

  /**
   * 找回密码：向邮箱发送验证码，验证码存 Redis（10 分钟 TTL）
   * 无论账号是否存在都返回成功，防止枚举已注册邮箱
   */
  async forgotPassword(dto: ForgotPasswordDto, req: Request): Promise<ForgotPasswordRespDto> {
    const isHttpClient = req.headers['x-req-method'] === 'httpClient'
    const isDev = this.configService.get('NODE_ENV') === 'development' && isHttpClient
    const user = await this.userService.findUserWithPasswordByEmail(dto.email)

    // 生成 6 位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const redisKey = `${this.FORGOT_CODE_PREFIX}${dto.email}`

    // 账号不存在：写入一个无效验证码占位，保持响应一致，防止邮箱枚举（同时不发送邮件）
    const codeToStore = user ? code : '000000'
    await this.redisService.set(redisKey, codeToStore, this.FORGOT_CODE_EXPIRE)

    if (user) {
      // 异步发送邮件，不阻塞接口响应（验证码已写入 Redis，邮件送达与否不影响本次请求）；
      // 发送失败仅记录错误日志，保持响应一致，防止邮箱枚举
      void this.mailService.sendVerificationCode(dto.email, code).catch((error) => {
        this.logger.error(`验证码邮件发送失败 email=${dto.email}`, error)
      })
    }

    this.logger.log(
      `[forgotPassword] email=${dto.email}, code=${codeToStore}, ttl=${this.FORGOT_CODE_EXPIRE}s`,
    )
    return isDev ? { devCode: codeToStore } : {}
  }

  /**
   * 找回密码：校验邮箱验证码并重置密码，同时踢掉该用户所有已登录会话
   */
  async forgotResetPassword(dto: ForgotPasswordResetDto, req: Request): Promise<null> {
    const isHttpClient = req.headers['x-req-method'] === 'httpClient'
    const isDev = this.configService.get('NODE_ENV') === 'development' && isHttpClient

    // 1. 校验验证码（一次性：无论成败立即销毁）
    const redisKey = `${this.FORGOT_CODE_PREFIX}${dto.email}`
    const realCode = await this.redisService.get(redisKey)
    if (realCode) {
      await this.redisService.del(redisKey)
    }
    if (!realCode || realCode !== dto.code.trim()) {
      throw new UnauthorizedException('验证码错误或已过期')
    }

    // 2. 查找用户
    const user = await this.userService.findUserWithPasswordByEmail(dto.email)
    if (!user || !user.id) {
      throw new NotFoundException('未找到该邮箱对应的用户')
    }

    // 3. 解密新密码（开发环境直传明文），解密后校验明文长度（6-32 位，与前端校验一致）
    let plainPassword: string
    if (isDev) {
      plainPassword = dto.newPassword
    } else {
      if (!dto.keyId) {
        throw new UnauthorizedException('验证不通过')
      }
      plainPassword = await this.helperService.decryptPassword(dto.newPassword, dto.keyId)
    }
    if (!plainPassword || plainPassword.length < 6 || plainPassword.length > 32) {
      throw new BadRequestException('密码长度需为 6-32 位')
    }
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    // 4. 更新密码并踢掉旧会话
    await this.userService.updateUserPassword(user.id, passwordHash)
    await this.redisService.del(`auth:token:${user.id}`)
    await this.redisService.del(`auth:refresh:${user.id}`)

    return null
  }
}
