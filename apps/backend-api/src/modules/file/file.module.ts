import { Module } from '@nestjs/common'
import { FileController } from '@/modules/file/file.controller'
import { FileService } from '@/modules/file/file.service'

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
