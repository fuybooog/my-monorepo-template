import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from '@/modules/auth/auth.controller'
import { AuthService } from '@/modules/auth/auth.service'
import { AuthInitGuard } from '@/modules/auth/auth-init.guard'
import { AuthInitService } from '@/modules/auth/auth-init.service'
import { UserModule } from '@/modules/user/user.module'
import { RoleModule } from '@/modules/role/role.module'
import { ResourceModule } from '@/modules/resource/resource.module'
import { SharedModule } from '@/modules/shared/shared.module'
import { MailModule } from '@/modules/mail/mail.module'

@Module({
  imports: [
    UserModule,
    RoleModule,
    ResourceModule,
    SharedModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthInitService, AuthInitGuard],
  exports: [JwtModule],
})
export class AuthModule {}
