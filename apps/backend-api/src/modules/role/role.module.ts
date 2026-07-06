import { Module } from '@nestjs/common'
import { RoleController } from '@/modules/role/role.controller'
import { RoleService } from '@/modules/role/role.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from '@/modules/role/entities/role.entity'
import { RoleRepository } from '@/modules/role/role.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
