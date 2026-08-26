import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from '@/modules/auth/auth.service'
import {
  CaptchaResponseDto,
  CurrentLoginResponseDto,
  LoginResponseDto,
  PasswordLoginDto,
  PhoneLoginDto,
  PublicKeyRespDto,
} from '@/modules/auth/auth.dto'
import type { Response, Request } from 'express'
import { Public } from '@/decorators/public.decorator'
import { CurrentUser } from '@/decorators/current-user.decorator'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiSuccessResponse } from '@/decorators/api-response.decorator'

import { AuthInitService } from '@/modules/auth/auth-init.service'
import { AuthInitGuard } from '@/modules/auth/auth-init.guard'

@ApiTags('鉴权模块')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authInitService: AuthInitService,
  ) {}

  @Post('passwordLogin')
  @Public()
  @ApiOperation({ summary: '密码登录' })
  @ApiSuccessResponse(LoginResponseDto)
  async passwordLogin(
    @Body() body: PasswordLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    return await this.authService.passwordLogin(body, res, req)
  }

  @Post('phoneLogin')
  @Public()
  async phoneLogin(@Body() body: PhoneLoginDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.phoneLogin(body, res)
  }

  @Get('currentLogin')
  @ApiSuccessResponse(CurrentLoginResponseDto)
  async currentLogin(
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<CurrentLoginResponseDto> {
    return Promise.resolve(user || null)
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: '退出登录' })
  @ApiSuccessResponse()
  async logout(
    @CurrentUser() user: CurrentLoginResponseDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.logout(user, res)
  }

  @Get('publicKey')
  @Public()
  @ApiOperation({ summary: '获取公钥' })
  @ApiSuccessResponse(PublicKeyRespDto)
  async getPublicKey() {
    return this.authService.getPublicKey()
  }

  @Get('captcha')
  @Public()
  @ApiOperation({ summary: '获取图形验证码' })
  @ApiSuccessResponse(CaptchaResponseDto)
  async createCaptcha() {
    return this.authService.createCaptcha()
  }
  @Post('init')
  @Public()
  @UseGuards(AuthInitGuard)
  @ApiOperation({ summary: '初始化管理员' })
  @ApiSuccessResponse()
  async initAdmin(@Body('plainPassword') plainPassword: string) {
    return this.authInitService.initAdmin(plainPassword)
  }
}
