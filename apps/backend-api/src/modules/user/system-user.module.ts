import { Module } from '@nestjs/common'
import { SystemUserController } from '@/modules/user/system-user.controller'
import { SystemUserService } from '@/modules/user/system-user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SystemUser } from '@/modules/user/entities/system-user.entity'
import { UserRepository } from '@/modules/user/system-user.repository'
import { SystemRole } from '@/modules/role/entities/system-role.entity'
import { SystemResourceGenerated } from '../resource/entities/system-resource.generated'

@Module({
  imports: [TypeOrmModule.forFeature([SystemUser, SystemRole, SystemResourceGenerated])],
  controllers: [SystemUserController],
  providers: [SystemUserService, UserRepository],
  exports: [SystemUserService, UserRepository],
})
export class SystemUserModule {}
