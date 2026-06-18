import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum LoginType {
  PASSWORD = 'password',
  PHONE = 'phone',
}

export class PasswordLoginDto {
  @ApiProperty({ enum: LoginType, description: '登录类型' })
  @IsEnum(LoginType)
  type!: LoginType.PASSWORD

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  @IsString()
  userName!: string

  @ApiProperty({ description: '密码' })
  @IsNotEmpty()
  @IsString()
  password!: string
}

export class PhoneLoginDto {
  @ApiProperty({ enum: LoginType })
  @IsEnum(LoginType)
  type!: LoginType.PHONE

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
  id!: string
  @ApiProperty({ description: '用户名', example: 'testName' })
  userName!: string
  @ApiProperty({ description: '用户角色列表', example: '["admin"]' })
  roles?: string[]
  @ApiProperty({ description: '用户权限列表', example: '["sys:user:delete"]' })
  permissions?: string[]
}

export class LoginResponseDto {
  @ApiProperty({ description: '用户ID', example: 'testId' })
  id!: string

  @ApiProperty({ description: '用户名', example: 'testName' })
  userName!: string

  @ApiProperty({ description: '角色列表', example: '["admin"]' })
  roles?: string[]
}
