import { Injectable, UnauthorizedException } from '@nestjs/common'
import { RedisService } from '@/utils/redis/redisService'
import forge from 'node-forge'

@Injectable()
export class HelperService {
  private readonly KEY_PREFIX = 'auth:rsa:pair:'

  constructor(private readonly redisService: RedisService) {}

  async decryptPassword(encryptedPasswordBase64: string, keyId: string): Promise<string> {
    const privateKeyPem = await this.redisService.get(`${this.KEY_PREFIX}${keyId}`)

    if (!privateKeyPem) {
      throw new UnauthorizedException('密码凭证已过期，请刷新页面后重试')
    }

    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      const encryptedBytes = forge.util.decode64(encryptedPasswordBase64)
      const decrypted = privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5')

      await this.redisService.del(`${this.KEY_PREFIX}${keyId}`)

      return decrypted
    } catch (error) {
      throw new UnauthorizedException('密码解密失败')
    }
  }
}
