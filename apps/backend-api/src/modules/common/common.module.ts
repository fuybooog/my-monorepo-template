import { Module } from '@nestjs/common'
import { CommonController } from '@/modules/common/common.controller'
import { CommonService } from '@/modules/common/common.service'

@Module({
  imports: [],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
