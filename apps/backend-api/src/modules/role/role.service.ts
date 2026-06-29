import { Injectable, NotFoundException } from '@nestjs/common'

import { RolePageRespDto } from '@/modules/role/dto/role.page.resp.dto'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { RolePageOptionDto } from '@/modules/role/dto/role.page.option.dto'
import { RoleRespDto } from '@/modules/role/dto/role.resp.dto'
import { RoleListRespDto } from '@/modules/role/dto/role.list.resp.dto'
import { RoleCreateDto } from '@/modules/role/dto/role.create.resp.dto'
import { RoleUpdateDto } from '@/modules/role/dto/role.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { RoleRepository } from '@/modules/role/role.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { Role } from '@/modules/role/entities/role.entity'

@Injectable()
export class RoleService {
  static readonly SEARCHABLE_FIELDS = ['roleName', 'mobile', 'pinyin']
  constructor(private readonly roleRepository: RoleRepository) {}
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
      const selectFields = fields.map((field) => `role.${field}`)
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
  async findRoleListByIds(ids: number[]): Promise<RoleListRespDto | null> {
    const findOptions: FindManyOptions<Role> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.roleRepository.find(findOptions)
    const list = plainToInstance(RoleRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((role) => role.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createRole(roleCreateDto: RoleCreateDto): Promise<RoleRespDto | null> {
    return null
  }
  async updateRole(id: number, roleUpdateDto: RoleUpdateDto): Promise<RoleRespDto | null> {
    return null
  }
  async removeRole(id: number): Promise<null> {
    return null
  }
  async batchRemoveRole(ids: number[]): Promise<BatchRespDto | null> {
    return null
  }
  async updateRoleStatus(id: number, roleUpdateDto: Pick<RoleUpdateDto, 'status'>): Promise<null> {
    return null
  }
  async batchUpdateRoleStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return null
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
