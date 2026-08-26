import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'

export class AdminResetPasswordDto {
  @ApiProperty({ description: '解密id', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '解密id不能为空' })
  keyId: string
  @ApiProperty({ description: '新密码', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string
  @ApiProperty({ description: '用户id', type: Number, required: true })
  @IsInt()
  @IsNotEmpty({ message: '用户id不能为空' })
  userId: number
}
export class ResetPasswordDto {
  @ApiProperty({ description: 'old解密id', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: 'old解密id不能为空' })
  oldPasswordKeyId: string
  @ApiProperty({ description: 'new解密id', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: 'new解密id不能为空' })
  newPasswordKeyId: string
  @ApiProperty({ description: '旧密码', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string
  @ApiProperty({ description: '新密码', type: String, required: true })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string
  @ApiProperty({ description: '用户id', type: Number, required: true })
  @IsInt()
  @IsNotEmpty({ message: '用户id不能为空' })
  userId: number
}
