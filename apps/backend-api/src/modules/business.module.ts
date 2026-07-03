import { Module } from '@nestjs/common'
import { AuthModule, CommonModule, UserModule } from '@/modules'

const SHARED_MODULES = [AuthModule, CommonModule, UserModule] as const

@Module({
  imports: [...SHARED_MODULES],
  exports: [...SHARED_MODULES],
})
export class BusinessModule {}
