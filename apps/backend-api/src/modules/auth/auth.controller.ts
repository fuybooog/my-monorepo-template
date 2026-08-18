import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import { AuthService } from '@/modules/auth/auth.service'
import {
  CurrentLoginResponseDto,
  LoginResponseDto,
  PasswordLoginDto,
  PhoneLoginDto,
} from '@/modules/auth/auth.dto'
import type { Response } from 'express'
import { Public } from '@/decorators/public.decorator'
import { CurrentUser } from '@/decorators/current-user.decorator'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiSuccessResponse } from '@/decorators/api-response.decorator'

import { ApiResponseDto } from '@/dto/api-response.dto'

@ApiTags('鉴权模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('passwordLogin')
  @Public()
  @ApiOperation({ summary: '密码登录' })
  @ApiSuccessResponse(LoginResponseDto)
  async passwordLogin(
    @Body() body: PasswordLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    return await this.authService.passwordLogin(body, res)
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
}
