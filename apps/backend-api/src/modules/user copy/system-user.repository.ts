import { DataSource, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { SystemUser } from '@/modules/user/entities/system-user.entity'
import { SystemUserPageDto } from '@/modules/user/system-user.dto'
import { isTargetOrParent } from '@/utils/fns'

@Injectable()
export class UserRepository extends Repository<SystemUser> {
  constructor(private dataSource: DataSource) {
    super(SystemUser, dataSource.createEntityManager())
  }

  async searchUsersByPage(query: SystemUserPageDto) {
    const { page = 1, pageSize = 10, userName } = query

    const qb = this.createQueryBuilder('user')

    if (userName) {
      qb.andWhere('user.userName LIKE :userName', { userName })
    }

    // todo 排序应该从前端传入
    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
  async findUserById(id: number) {
    const queryBuilder = this.createQueryBuilder('user')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, SystemUser)
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => `user.${col.propertyName}`)

    safeFields.unshift('user.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    queryBuilder.leftJoinAndSelect('user.roles', 'role')

    return await queryBuilder.where('user.id = :id', { id }).getOne()
  }
}
