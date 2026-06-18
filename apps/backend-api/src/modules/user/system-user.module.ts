import { Module } from '@nestjs/common'
import { SystemUserController } from '@/modules/user/system-user.controller'
import { SystemUserService } from '@/modules/user/system-user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SystemUser } from '@/modules/user/entities/system-user.entity'
import { UserRepository } from '@/modules/user/system-user.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemUser])
  ],
  controllers: [SystemUserController],
  providers: [SystemUserService, UserRepository],
  exports: [SystemUserService, UserRepository]
})
export class SystemUserModule {}
