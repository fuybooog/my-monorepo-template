import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator'
import { Expose } from 'class-transformer'

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
export class FindRolesByUserIdResp {
  @ApiProperty({ description: '角色id列表', type: [Number] })
  @IsArray()
  @Expose()
  list: number[]
}
export class AssignRolesToUserDto {
  @ApiProperty({ description: '角色id列表', type: [Number], required: true })
  @IsArray()
  @IsNotEmpty({ message: '角色id列表不能为空' })
  roleIds: number[]
}
