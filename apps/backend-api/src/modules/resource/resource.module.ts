import { Module } from '@nestjs/common'
import { ResourceController } from '@/modules/resource/resource.controller'
import { ResourceService } from '@/modules/resource/resource.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { ResourceRepository } from '@/modules/resource/resource.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourceController],
  providers: [ResourceService, ResourceRepository],
  exports: [ResourceService, ResourceRepository],
})
export class ResourceModule {}
