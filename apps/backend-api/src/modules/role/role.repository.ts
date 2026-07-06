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

    // todo 排序应该从前端传入
    qb.orderBy('role.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
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
}
