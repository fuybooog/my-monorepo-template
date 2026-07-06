import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { User } from '@/modules/user/entities/user.entity'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { UserCreateDto } from './dto/user.create.dto'
import { UserUpdateDto } from './dto/user.update.dto'

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager())
  }

  async searchUsersByPage(query: UserPageDto) {
    const { page = 1, pageSize = 10, userName, sort } = query

    const qb = this.createQueryBuilder('user')

    if (userName) {
      qb.andWhere('user.userName LIKE :userName', { userName: `%${userName}%` })
    }

    if (sort && Object.keys(sort).length > 0) {
      const allowedFields = ['userName', 'createdAt', 'updatedAt']

      let isFirst = true
      for (const [key, direction] of Object.entries(sort)) {
        if (allowedFields.includes(key)) {
          // 拼接成类似 'user.userName' 的全称
          const orderField = `user.${key}`

          if (isFirst) {
            qb.orderBy(orderField, direction)
            isFirst = false
          } else {
            qb.addOrderBy(orderField, direction)
          }
        }
      }
      qb.addOrderBy('user.id', 'ASC')
    } else {
      // 默认排序：如果没有传入任何排序，走默认的降序
      qb.orderBy('user.createdAt', 'DESC').addOrderBy('user.id', 'ASC')
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    return await qb.getManyAndCount()
  }
  async findUserById(id: number) {
    const queryBuilder = this.createQueryBuilder('user')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, User)
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => `user.${col.propertyName}`)

    safeFields.unshift('user.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    queryBuilder.leftJoinAndSelect('user.roles', 'role')

    return await queryBuilder.where('user.id = :id', { id }).getOne()
  }

  async createUser(userCreateDto: UserCreateDto, manager: EntityManager) {
    const userInstance = manager.create(User, userCreateDto)
    const savedUser = await manager.save(User, userInstance)
    return savedUser
  }

  async updateUser(user: User, userUpdateDto: UserUpdateDto, manager: EntityManager) {
    const updatedUser = Object.assign(user, userUpdateDto)
    return await manager.save(User, updatedUser)
  }
  async removeUser(user: User, manager: EntityManager) {
    user.deletedAt = new Date()
    return await manager.save(User, user)
  }
  async batchRemoveUser(users: User[], manager: EntityManager) {
    users.forEach((user) => {
      user.deletedAt = new Date()
    })
    return await manager.save(users)
  }
  async updateUserStatus(user: User, status: string, manager: EntityManager) {
    user.status = status
    return await manager.save(User, user)
  }
  async batchUpdateUserStatus(users: User[], status: string, manager: EntityManager) {
    users.forEach((user) => {
      user.status = status
    })
    return await manager.save(users)
  }
}
