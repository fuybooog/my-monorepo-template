import { Injectable, NotFoundException } from '@nestjs/common'

import { RolePageRespDto } from '@/modules/role/dto/role.page.resp.dto'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { RolePageOptionDto } from '@/modules/role/dto/role.page.option.dto'
import { RoleRespDto } from '@/modules/role/dto/role.resp.dto'
import { RoleListRespDto } from '@/modules/role/dto/role.list.resp.dto'
import { RoleCreateDto } from '@/modules/role/dto/role.create.dto'
import { RoleUpdateDto } from '@/modules/role/dto/role.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { RoleRepository } from '@/modules/role/role.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { Role } from '@/modules/role/entities/role.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'

@Injectable()
export class RoleService {
  static readonly SEARCHABLE_FIELDS = ['roleName']
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly dataSource: DataSource,
  ) {}
  async pageRole(rolePageDto: RolePageDto): Promise<PaginatedResult<RolePageRespDto>> {
    const { list: entities, total } = await this.roleRepository.searchRolesByPage(rolePageDto)
    const list = plainToInstance(RolePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: rolePageDto.page,
      pageSize: rolePageDto.pageSize,
    }
  }
  async pageOptionRole(
    rolePageOptionDto: RolePageOptionDto,
  ): Promise<PaginatedResult<RolePageRespDto>> {
    const { keyword, fields, page, pageSize } = rolePageOptionDto
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `role.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = RoleService.SEARCHABLE_FIELDS.map((item) => `role.${item} LIKE :keyword`).join(
        ' OR ',
      )
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(RolePageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findRoleById(id: number): Promise<RoleRespDto | null> {
    return await this.dataSource.transaction(async (manager) => {
      // 直接用 repository 中的 api 进行查询
      const roleEntity = await this.roleRepository.findOne({
        where: { id },
      })
      if (!roleEntity) {
        throw new NotFoundException(`未找到id为${id}的角色`)
      }
      // 将关联的资源ids和用户ids查出来
      const resourceIds = await this.roleRepository.getResourceIdsByRoleId(id, manager)
      const userIds = await this.roleRepository.getUserIdsByRoleId(id, manager)
      return plainToInstance(
        RoleRespDto,
        {
          ...roleEntity,
          resourceIds: resourceIds.join(','),
          userIds: userIds.join(','),
        },
        { excludeExtraneousValues: true },
      )
    })
  }
  async findRoleListByIds(ids: string): Promise<RoleListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<Role> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.roleRepository.find(findOptions)
    const list = plainToInstance(RoleRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((role) => role.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createRole(roleCreateDto: RoleCreateDto): Promise<RoleRespDto | null> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const roleEntity = await this.roleRepository.createRole(roleCreateDto, manager)

        if (roleCreateDto.userIds) {
          const userIdList = roleCreateDto.userIds.split(',').map((id) => Number.parseInt(id))
          await this.roleRepository.assignUsersToRole(roleEntity, userIdList, manager)
        }

        if (roleCreateDto.resourceIds) {
          const resourceIdsList = roleCreateDto.resourceIds
            .split(',')
            .map((id) => Number.parseInt(id))
          await this.roleRepository.assignResourcesToRole(roleEntity, resourceIdsList, manager)
        }
        return roleEntity
      } catch (e) {
        console.log('创建角色失败', e)
        throw e
      }
    })
  }
  async updateRole(id: number, roleUpdateDto: RoleUpdateDto): Promise<RoleRespDto | null> {
    return await this.dataSource.transaction(async (manager) => {
      const roleEntity = await this.roleRepository.findOne({
        where: { id },
      })
      if (!roleEntity) {
        throw new BusinessException(`未找到id为${id}的角色`)
      }
      const updatedRoleEntity = await this.roleRepository.updateRole(
        roleEntity,
        roleUpdateDto,
        manager,
      )
      // 当 roleUpdateDto.userIds 为 空字符串时，表示清空当前角色下的所有用户，不传 userIds 表示不修改当前角色下的用户
      if (roleUpdateDto.userIds !== undefined) {
        const userIdList = roleUpdateDto.userIds
          ? roleUpdateDto.userIds.split(',').map((id) => Number.parseInt(id))
          : []
        // 先查询当前角色下的所有userId，对比差异，删除不在userIdList中的用户，新增在userIdList中但不在当前角色下的用户
        const roleUserIds: number[] = await this.roleRepository.getUserIdsByRoleId(id, manager)
        const userIdsToRemove = roleUserIds.filter((userId) => !userIdList.includes(userId))
        const userIdsToAdd = userIdList.filter((userId) => !roleUserIds.includes(userId))
        if (userIdsToRemove.length > 0) {
          await this.roleRepository.removeUsersFromRole(
            updatedRoleEntity.id!,
            userIdsToRemove,
            manager,
          )
        }
        if (userIdsToAdd.length > 0) {
          await this.roleRepository.assignUsersToRole(updatedRoleEntity, userIdsToAdd, manager)
        }
      }
      // 当 roleUpdateDto.resourceIds 为 空字符串时，表示清空当前角色下的所有资源，不传 resourceIds 表示不修改当前角色下的资源
      if (roleUpdateDto.resourceIds !== undefined) {
        const resourceIdsList = roleUpdateDto.resourceIds
          ? roleUpdateDto.resourceIds.split(',').map((id) => Number.parseInt(id))
          : []
        // 先查询当前角色下所有的resourceId，对比差异，删除不在resourceIdsList中的资源，新增在resourceIdsList中但不在当前角色下的资源
        const roleResourceIds: number[] = await this.roleRepository.getResourceIdsByRoleId(
          id,
          manager,
        )
        const resourceIdsToRemove = roleResourceIds.filter(
          (resourceId) => !resourceIdsList.includes(resourceId),
        )
        const resourceIdsToAdd = resourceIdsList.filter(
          (resourceId) => !roleResourceIds.includes(resourceId),
        )
        if (resourceIdsToRemove.length > 0) {
          await this.roleRepository.removeResourcesFromRole(
            updatedRoleEntity.id!,
            resourceIdsToRemove,
            manager,
          )
        }
        if (resourceIdsToAdd.length > 0) {
          await this.roleRepository.assignResourcesToRole(
            updatedRoleEntity,
            resourceIdsToAdd,
            manager,
          )
        }
      }
      return updatedRoleEntity
    })
  }
  async removeRole(id: number): Promise<null> {
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.roleRepository.removeRole(roleEntity, manager)
      return null
    })
  }
  async batchRemoveRole(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const roles = await this.roleRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (roles.length !== ids.length) {
      missingIds = idList.filter((id) => !roles.some((role) => role.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.roleRepository.batchRemoveRole(roles, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }
  async updateRoleStatus(id: number, roleUpdateDto: UpdateStatusDto): Promise<null> {
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.roleRepository.updateRoleStatus(roleEntity, roleUpdateDto.status, manager)
      return null
    })
  }
  async batchUpdateRoleStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const roles = await this.roleRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (roles.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !roles.some((role) => role.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.roleRepository.batchUpdateRoleStatus(roles, batchUpdateStatusDto.status, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }

  async downloadTemplate() {
    return null
  }
  async importRole() {
    return null
  }
  async exportRole() {
    return null
  }
}
