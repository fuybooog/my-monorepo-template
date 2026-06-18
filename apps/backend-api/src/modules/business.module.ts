import { Module } from '@nestjs/common'
import { AuthModule, CommonModule, SystemUserModule } from '@/modules'

const SHARED_MODULES = [AuthModule, CommonModule, SystemUserModule] as const

@Module({
  imports: [...SHARED_MODULES],
  exports: [...SHARED_MODULES],
})
export class BusinessModule {}
