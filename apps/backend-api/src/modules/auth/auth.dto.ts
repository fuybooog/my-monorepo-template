import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class PasswordLoginDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  @IsString()
  userName!: string

  @ApiProperty({ description: '密码' })
  @IsNotEmpty()
  @IsString()
  password!: string

  @ApiProperty({ description: '验证码Key' })
  @IsOptional()
  @IsString()
  captchaKey?: string

  @ApiProperty({ description: '验证码' })
  @IsOptional()
  @IsString()
  captchaCode?: string

  @ApiProperty({ description: '公钥Key', example: '' })
  @IsOptional()
  @IsString()
  keyId?: string
}

export class PhoneLoginDto {
  @ApiProperty({ description: '手机号' })
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  phone!: string

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty()
  @IsString()
  code!: string
}

export class CurrentLoginResponseDto {
  @ApiProperty({ description: '用户ID', example: 'testId' })
  id!: number
  @ApiProperty({ description: '用户名', example: 'testName' })
  userName!: string
  @ApiProperty({ description: '昵称', example: 'testName' })
  nickName!: string
  @ApiProperty({ description: '最高角色等级', example: '10' })
  maxLevel!: number
  @ApiProperty({ description: '用户角色列表', example: '[1, 2]' })
  roleCodes?: string[]
  @ApiProperty({ description: '用户权限列表', example: '["sys:user:delete"]' })
  permissions?: string[]
}

export class LoginResponseDto {
  @ApiProperty({ description: '用户ID', example: 'testId' })
  id!: number

  @ApiProperty({ description: '用户名', example: 'testName' })
  userName!: string

  @ApiProperty({ description: '角色列表', example: '' })
  roleCodes?: string[]

  @ApiProperty({ description: '昵称', example: '' })
  nickName?: string
}

export class PublicKeyRespDto {
  @ApiProperty({ description: '公钥', example: '' })
  @Expose()
  publicKey!: string
  @ApiProperty({ description: '公钥Key', example: '' })
  @Expose()
  keyId!: string
}

export class CaptchaResponseDto {
  @ApiProperty({ description: '图形验证码', example: '' })
  @Expose()
  captchaImg!: string
  @ApiProperty({ description: '图形验证码Key', example: '' })
  @Expose()
  captchaKey!: string
}

export class ForgotPasswordDto {
  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty()
  @IsEmail()
  email!: string
}

export class ForgotPasswordResetDto {
  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ description: '邮箱验证码' })
  @IsNotEmpty()
  @IsString()
  code!: string

  @ApiProperty({ description: '新密码' })
  @IsNotEmpty()
  @IsString()
  // 注意：传输的是 RSA 加密后的密文（Base64，长度远超明文），
  // 因此此处不做长度限制；6-32 位明文长度校验在解密后于 Service 层进行
  newPassword!: string

  @ApiProperty({ description: '公钥Key', example: '' })
  @IsOptional()
  @IsString()
  keyId?: string
}

export class ForgotPasswordRespDto {
  @ApiProperty({ description: '开发环境回显的验证码，生产环境不返回', example: '' })
  @Expose()
  devCode?: string
}
