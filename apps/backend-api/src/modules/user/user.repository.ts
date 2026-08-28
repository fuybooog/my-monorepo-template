import { Brackets, DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { User } from '@/modules/user/entities/user.entity'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { UserCreateDto } from './dto/user.create.dto'
import { UserUpdateDto } from './dto/user.update.dto'
import { MAX_ROLE_LEVEL } from '@/constants'

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager())
  }

  async searchUsersByPage(query: UserPageDto, maxLevel = 0) {
    const { page = 1, pageSize = 10, userName, sort, status, birthStart, birthEnd, keyword } = query

    const qb = this.createQueryBuilder('user')
    if (keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.userName LIKE :keyword', { keyword: `%${keyword}%` }).orWhere(
            'user.email LIKE :keyword',
            { keyword: `%${keyword}%` },
          )
        }),
      )
    } else if (userName) {
      qb.andWhere('user.userName LIKE :userName', { userName: `%${userName}%` })
    }
    if (status) {
      qb.andWhere('user.status = :status', { status: status })
    }
    if (birthStart) {
      qb.andWhere('user.birth >= :birthStart', { birthStart: birthStart })
    }
    if (birthEnd) {
      qb.andWhere('user.birth <= :birthEnd', { birthEnd: birthEnd })
    }

    // 如果不是超级管理员，则需要限制
    if (maxLevel !== MAX_ROLE_LEVEL) {
      qb.leftJoin('user.roles', 'role').groupBy('user.id')

      const havingClause = 'MAX(role.level) <= :maxLevel'
      qb.having(`${havingClause} OR MAX(role.level) IS NULL`, { maxLevel })
    }
    if (sort && Object.keys(sort).length > 0) {
      const allowedFields = ['userName', 'createdAt', 'updatedAt']
      let isFirst = true

      for (const [key, direction] of Object.entries(sort)) {
        if (allowedFields.includes(key)) {
          const orderField = `user.${key}`
          if (isFirst) {
            qb.orderBy(orderField, direction as 'ASC' | 'DESC')
            isFirst = false
          } else {
            qb.addOrderBy(orderField, direction as 'ASC' | 'DESC')
          }
        }
      }
      qb.addOrderBy('user.id', 'ASC')
    } else {
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

  async updateUser(
    user: User,
    userUpdateDto: UserUpdateDto & { password?: string },
    manager: EntityManager,
  ) {
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
  async searchRoleIdsByUserId(userId: number) {
    const result = await this.manager
      .createQueryBuilder()
      .select('user_role.role_id', 'roleId')
      .from('system_user_role', 'user_role')
      .where('user_role.user_id = :userId', { userId })
      .getRawMany()
    return result.map((row) => Number(row.roleId)).filter((id) => !isNaN(id))
  }
  async updateUserPassword(userId: number, passwordHash: string, manager: EntityManager) {
    const user = await manager.findOne(User, { where: { id: userId } })
    if (!user) {
      throw new Error(`User with ID ${userId} not found`)
    }
    user.password = passwordHash
    return await manager.save(User, user)
  }
  async getRoleIdsByUserId(userId: number, manager?: EntityManager): Promise<number[]> {
    const result = await (manager || this.manager)
      .createQueryBuilder()
      .select('user_role.role_id', 'roleId')
      .from('system_user_role', 'user_role') // 直接查中间表
      .where('user_role.user_id = :userId', { userId })
      .getRawMany()

    // 确保转为 number 类型（防止数据库驱动返回字符串）
    return result.map((row) => Number(row.roleId)).filter((id) => !isNaN(id))
  }

  async assignRolesToUser(roleIds: number[], userId: number, manager?: EntityManager) {
    if (!roleIds || roleIds.length === 0) return

    // 1. 拼装批量插入的对象数组
    const userRoleEntities = roleIds.map((roleId) => ({
      user_id: userId,
      role_id: roleId,
    }))

    // 2. 直接对中间表执行批量插入
    // 注意：如果表存在联合主键 (user_id, role_id)，可以使用 orIgnore() 过滤已存在的重复绑定
    await (manager || this.manager)
      .createQueryBuilder()
      .insert()
      .into('system_user_role') // 中间表表名
      .values(userRoleEntities)
      .orIgnore() // 可选：MySQL 下相当于 INSERT IGNORE，防止重复插入报错
      .execute()
  }
}
