import { Module } from '@nestjs/common'
import {
  AuthModule,
  ExcelModule,
  FileModule,
  OperationLogModule,
  UserModule,
  ValueSetModule,
  ResourceModule,
  RoleModule,
  SharedModule,
} from '@/modules'

const SHARED_MODULES = [
  ExcelModule,
  AuthModule,
  FileModule,
  OperationLogModule,
  UserModule,
  ValueSetModule,
  ResourceModule,
  RoleModule,
  SharedModule,
] as const

@Module({
  imports: [...SHARED_MODULES],
  exports: [...SHARED_MODULES],
})
export class BusinessModule {}
