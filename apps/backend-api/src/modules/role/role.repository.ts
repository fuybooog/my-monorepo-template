import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Role } from '@/modules/role/entities/role.entity'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { RoleCreateDto } from './dto/role.create.dto'
import { RoleUpdateDto } from './dto/role.update.dto'

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager())
  }

  async searchRolesByPage(query: RolePageDto) {
    const { page = 1, pageSize = 10 } = query

    const qb = this.createQueryBuilder('role')
      // 1. 统计关联的用户数量
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(ur.user_id)', 'userCount')
          .from('system_user_role', 'ur')
          .where('ur.role_id = role.id')
      }, 'userCount')
      // 2. 统计关联的资源数量
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(rr.resource_id)', 'resourceCount')
          .from('system_role_resource', 'rr')
          .where('rr.role_id = role.id')
      }, 'resourceCount')
      // 3. 排序与分页
      .orderBy('role.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    // 4. 获取实体列表与总条数
    const [roles, total] = await qb.getManyAndCount()

    // 5. 补充：因为子查询的字段属于 Raw 属性，需要提取并挂载到返回列表中
    const rawAndEntities = await qb.getRawAndEntities()

    const list = rawAndEntities.entities.map((roleEntity, index) => {
      const rawRow = rawAndEntities.raw[index]
      return {
        ...roleEntity,
        userCount: Number(rawRow.userCount || 0),
        resourceCount: Number(rawRow.resourceCount || 0),
      }
    })

    return {
      list,
      total,
    }
  }
  async findRoleById(id: number) {
    const queryBuilder = this.createQueryBuilder('role')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, Role)
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => `role.${col.propertyName}`)

    safeFields.unshift('role.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    queryBuilder.leftJoinAndSelect('role.roles', 'role')

    return await queryBuilder.where('role.id = :id', { id }).getOne()
  }

  async createRole(roleCreateDto: RoleCreateDto, manager: EntityManager) {
    const roleInstance = manager.create(Role, roleCreateDto)
    const savedRole = await manager.save(Role, roleInstance)
    return savedRole
  }

  async updateRole(role: Role, roleUpdateDto: RoleUpdateDto, manager: EntityManager) {
    const updatedRole = Object.assign(role, roleUpdateDto)
    return await manager.save(Role, updatedRole)
  }
  async removeRole(role: Role, manager: EntityManager) {
    role.deletedAt = new Date()
    return await manager.save(Role, role)
  }
  async batchRemoveRole(roles: Role[], manager: EntityManager) {
    roles.forEach((role) => {
      role.deletedAt = new Date()
    })
    return await manager.save(roles)
  }
  async updateRoleStatus(role: Role, status: string, manager: EntityManager) {
    role.status = status
    return await manager.save(Role, role)
  }
  async batchUpdateRoleStatus(roles: Role[], status: string, manager: EntityManager) {
    roles.forEach((role) => {
      role.status = status
    })
    return await manager.save(roles)
  }
  async assignUsersToRole(role: Role, userIds: number[], manager: EntityManager) {
    if (!userIds || userIds.length === 0) return

    // 1. 拼装批量插入的对象数组
    const userRoleEntities = userIds.map((userId) => ({
      user_id: userId,
      role_id: role.id,
    }))

    // 2. 直接对中间表执行批量插入
    // 注意：如果表存在联合主键 (user_id, role_id)，可以使用 orIgnore() 过滤已存在的重复绑定
    await manager
      .createQueryBuilder()
      .insert()
      .into('system_user_role') // 中间表表名
      .values(userRoleEntities)
      .orIgnore() // 可选：MySQL 下相当于 INSERT IGNORE，防止重复插入报错
      .execute()
  }
  async assignResourcesToRole(role: Role, resourceIds: number[], manager: EntityManager) {
    if (!resourceIds || resourceIds.length === 0) return

    // 1. 拼装批量插入的对象数组
    const roleResourceEntities = resourceIds.map((resourceId) => ({
      resource_id: resourceId,
      role_id: role.id,
    }))

    // 2. 直接对中间表执行批量插入
    await manager
      .createQueryBuilder()
      .insert()
      .into('system_role_resource') // 中间表表名
      .values(roleResourceEntities)
      .orIgnore() // 可选：MySQL 下相当于 INSERT IGNORE，防止重复插入报错
      .execute()
  }
  async getUserIdsByRoleId(roleId: number, manager: EntityManager): Promise<number[]> {
    const result = await manager
      .createQueryBuilder()
      .select('user_role.user_id', 'userId')
      .from('system_user_role', 'user_role') // 直接查中间表
      .where('user_role.role_id = :roleId', { roleId })
      .getRawMany()

    // 确保转为 number 类型（防止数据库驱动返回字符串）
    return result.map((row) => Number(row.userId)).filter((id) => !isNaN(id))
  }
  async removeUsersFromRole(roleId: number, userIds: number[], manager: EntityManager) {
    // 1. 过滤掉无效值并去重
    const validUserIds = Array.from(new Set(userIds?.filter(Boolean)))

    if (validUserIds.length === 0) return

    // 2. 执行批量删除
    await manager
      .createQueryBuilder()
      .delete()
      .from('system_user_role')
      .where('role_id = :roleId AND user_id IN (:...userIds)', {
        roleId,
        userIds: validUserIds,
      })
      .execute()
  }
  async getResourceIdsByRoleId(roleId: number, manager: EntityManager): Promise<number[]> {
    const result = await manager
      .createQueryBuilder()
      .select('role_resource.resource_id', 'resourceId')
      .from('system_role_resource', 'role_resource') // 直接查中间表
      .where('role_resource.role_id = :roleId', { roleId })
      .getRawMany()

    // 确保转为 number 类型（防止数据库驱动返回字符串）
    return result.map((row) => Number(row.resourceId)).filter((id) => !isNaN(id))
  }
  async removeResourcesFromRole(roleId: number, resourceIds: number[], manager: EntityManager) {
    // 1. 过滤掉无效值并去重
    const validResourceIds = Array.from(new Set(resourceIds?.filter(Boolean)))

    if (validResourceIds.length === 0) return

    // 2. 执行批量删除
    await manager
      .createQueryBuilder()
      .delete()
      .from('system_role_resource')
      .where('role_id = :roleId AND resource_id IN (:...resourceIds)', {
        roleId,
        resourceIds: validResourceIds,
      })
      .execute()
  }
}
