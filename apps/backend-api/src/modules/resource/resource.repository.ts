import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'

@Injectable()
export class ResourceRepository extends Repository<Resource> {
  constructor(private dataSource: DataSource) {
    super(Resource, dataSource.createEntityManager())
  }

  async searchResourcesByPage(query: ResourcePageDto) {
    const { page = 1, pageSize = 10, label } = query

    const qb = this.createQueryBuilder('resource')

    if (label) {
      qb.andWhere('resource.label LIKE :label', { label })
    }

    // todo 排序应该从前端传入
    qb.orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
}
