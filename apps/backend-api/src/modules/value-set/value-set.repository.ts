import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'

@Injectable()
export class ValueSetRepository extends Repository<ValueSet> {
  constructor(private dataSource: DataSource) {
    super(ValueSet, dataSource.createEntityManager())
  }

  async searchValueSetsByPage(query: ValueSetPageDto) {
    const { page = 1, pageSize = 10, valueSetName } = query

    const qb = this.createQueryBuilder('value-set')

    if (valueSetName) {
      qb.andWhere('value-set.valueSetName LIKE :valueSetName', { valueSetName })
    }

    // todo 排序应该从前端传入
    qb.orderBy('value-set.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
}
