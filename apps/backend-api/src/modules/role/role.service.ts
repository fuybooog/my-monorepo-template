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
    const [entities, total] = await this.roleRepository.searchRolesByPage(rolePageDto)
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
    // 直接用 repository 中的 api 进行查询
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new NotFoundException(`未找到id为${id}的角色`)
    }
    return plainToInstance(RoleRespDto, roleEntity, { excludeExtraneousValues: true })
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
    // todo 检查是否唯一
    return await this.dataSource.transaction(async (manager) => {
      const roleEntity = await this.roleRepository.createRole(roleCreateDto, manager)
      // todo 添加角色角色
      return roleEntity
    })
  }
  async updateRole(id: number, roleUpdateDto: RoleUpdateDto): Promise<RoleRespDto | null> {
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    return await this.dataSource.transaction(async (manager) => {
      const updatedRoleEntity = await this.roleRepository.updateRole(
        roleEntity,
        roleUpdateDto,
        manager,
      )
      // todo 修改角色角色
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
