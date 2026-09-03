import { Module } from '@nestjs/common'
import { UserController } from '@/modules/user/user.controller'
import { UserService } from '@/modules/user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/modules/user/entities/user.entity'
import { UserRepository } from '@/modules/user/user.repository'
import { Role } from '@/modules/role/entities/role.entity'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { SharedModule } from '@/modules/shared/shared.module'
import { RoleModule } from '@/modules/role/role.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Resource]), SharedModule, RoleModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
