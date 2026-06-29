import { Module } from '@nestjs/common'
import { ValueSetController } from '@/modules/value-set/value-set.controller'
import { ValueSetService } from '@/modules/value-set/value-set.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { ValueSetRepository } from '@/modules/value-set/value-set.repository'

@Module({
  imports: [TypeOrmModule.forFeature([ValueSet])],
  controllers: [ValueSetController],
  providers: [ValueSetService, ValueSetRepository],
  exports: [ValueSetService, ValueSetRepository],
})
export class ValueSetModule {}
