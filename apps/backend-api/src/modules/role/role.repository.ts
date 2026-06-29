import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Role } from '@/modules/role/entities/role.entity'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager())
  }

  async searchRolesByPage(query: RolePageDto) {
    const { page = 1, pageSize = 10, roleName } = query

    const qb = this.createQueryBuilder('role')

    if (roleName) {
      qb.andWhere('role.roleName LIKE :roleName', { roleName })
    }

    // todo 排序应该从前端传入
    qb.orderBy('role.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
}
