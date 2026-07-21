import { Module } from '@nestjs/common'
import { AuthModule, CommonModule, UserModule } from '@/modules'
import { ValueSetModule } from './value-set/value-set.module'
import { ResourceModule } from './resource/resource.module'
import { RoleModule } from './role/role.module'

const SHARED_MODULES = [
  AuthModule,
  CommonModule,
  UserModule,
  ValueSetModule,
  ResourceModule,
  RoleModule,
] as const

@Module({
  imports: [...SHARED_MODULES],
  exports: [...SHARED_MODULES],
})
export class BusinessModule {}
