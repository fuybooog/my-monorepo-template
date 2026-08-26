import { Injectable, UnauthorizedException } from '@nestjs/common'
import {
  CurrentLoginResponseDto,
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
import bcrypt from 'bcrypt'
import { RoleService } from '@/modules/role/role.service'
import { JwtPayload } from '@/types'
import { HelperService } from '@/modules/shared/helper.service'
import { ConfigService } from '@nestjs/config'

const DUMMY_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s5gG73aG2W2O2'

@Injectable()
export class AuthService {
  private readonly CAPTCHA_PREFIX = 'auth:captcha:'
  private readonly CAPTCHA_EXPIRE = 180
  private readonly KEY_PREFIX = 'auth:rsa:pair:'
  private readonly KEY_EXPIRE_SECONDS = 600

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly helperService: HelperService,
    private readonly configService: ConfigService,
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

    if (user.status === '0') {
      throw new UnauthorizedException('用户已被禁用')
    }
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

    const payload: JwtPayload = {
      sub: String(user!.id!),
      userName: user!.userName!,
      nickName: user!.nickName!,
      roleCodes: roleCodes.join(),
      maxLevel,
      permissions: permissions.join(),
    }
    const jwtToken = this.jwtService.sign(payload)

    const redisKey = `auth:token:${user!.id}`
    const EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000

    await this.redisService.set(redisKey, jwtToken, EXPIRE_TIME)

    res.cookie('access_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: EXPIRE_TIME,
      path: '/',
    })
    return {
      roleCodes,
      id: user!.id as number,
      userName: user!.userName as string,
      nickName: user!.nickName as string,
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
