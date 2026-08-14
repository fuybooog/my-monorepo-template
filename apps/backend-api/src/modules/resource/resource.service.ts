import { Injectable, NotFoundException } from '@nestjs/common'

import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.dto'
import { ResourceUpdateDto } from '@/modules/resource/dto/resource.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ResourceRepository } from '@/modules/resource/resource.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, EntityManager, FindManyOptions, In, Not } from 'typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { ListResp } from '@/dto/base.dto'
import { ResourcePartialDto } from './dto/resource.base.dto'

@Injectable()
export class ResourceService {
  static readonly SEARCHABLE_FIELDS = ['resourceName']
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly dataSource: DataSource,
  ) {}
  async pageResource(
    resourcePageDto: ResourcePageDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    const [entities, total] = await this.resourceRepository.searchResourcesByPage(resourcePageDto)
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: resourcePageDto.page,
      pageSize: resourcePageDto.pageSize,
    }
  }
  async listAllResource(resourcePageDto: ResourcePageDto): Promise<ListResp<ResourcePageRespDto>> {
    const [entities] = await this.resourceRepository.searchResources(resourcePageDto)
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
    }
  }
  async listByUser(userId: number): Promise<ListResp<ResourcePageRespDto>> {
    // todo 判断userId 若非本人，则必须为管理员
    const [entities] = await this.resourceRepository.searchResourcesByUser(userId)
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
    }
  }
  async pageOptionResource(
    resourcePageOptionDto: ResourcePageOptionDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    const { keyword, fields, page, pageSize } = resourcePageOptionDto
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `resource.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ResourceService.SEARCHABLE_FIELDS.map(
        (item) => `resource.${item} LIKE :keyword`,
      ).join(' OR ')
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(ResourcePageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findResourceById(id: number): Promise<ResourceRespDto | null> {
    // 直接用 repository 中的 api 进行查询
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new NotFoundException(`未找到id为${id}的资源`)
    }
    return plainToInstance(ResourceRespDto, resourceEntity, { excludeExtraneousValues: true })
  }
  async findResourceListByIds(ids: string): Promise<ResourceListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<Resource> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.resourceRepository.find(findOptions)
    const list = plainToInstance(ResourceRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((resource) => resource.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createResource(resourceCreateDto: ResourceCreateDto): Promise<ResourceRespDto | null> {
    // todo 检查是否唯一
    const resourceEntity = await this.resourceRepository.findOne({
      where: { uniqueProp: resourceCreateDto.uniqueProp! },
      select: { id: true, deletedAt: true },
      withDeleted: true,
    })
    if (resourceEntity) {
      if (!resourceEntity.deletedAt) {
        throw new BusinessException('uniqueProp 重复，无法新增！')
      }
    }
    return await this.dataSource.transaction(async (manager) => {
      let createResourceEntity
      if (resourceEntity) {
        // 将此数据恢复
        createResourceEntity = await this.resourceRepository.updateResource(
          resourceEntity,
          {
            ...resourceCreateDto,
            deletedAt: null,
          },
          manager,
        )
      } else {
        createResourceEntity = await this.resourceRepository.createResource(
          resourceCreateDto,
          manager,
        )
      }
      return createResourceEntity
    })
  }
  async updateResource(
    id: number,
    resourceUpdateDto: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource.transaction(async (manager) => {
      const updatedResourceEntity = await this.resourceRepository.updateResource(
        resourceEntity,
        resourceUpdateDto,
        manager,
      )
      // todo 修改资源角色
      return updatedResourceEntity
    })
  }
  async batchUpdateResource(list: ResourcePartialDto[]) {
    if (!list || list.length === 0) {
      throw new BusinessException(`参数list不能为空`)
    }
    const updateItems = list.filter((item) => item.id && item.sortNumber !== undefined)
    const insertItems = list.filter((item) => !item.id)
    const ids = updateItems.map((item) => item.id)
    let invalidIds = []
    if (updateItems.length > 0) {
      const existing = await this.resourceRepository.find({
        where: { id: In(ids) },
        select: { id: true },
      })
      const existingIds = new Set(existing.map((r) => r.id))
      invalidIds = ids.filter((id) => !existingIds.has(id!))
    }
    return await this.dataSource.transaction(async (manager) => {
      for (const item of list) {
        if (item.id && item.sortNumber) {
          // 更新顺序
          if (!invalidIds.length) {
            // 有部分资源被删除了，无法批量更新顺序
            await manager.update(Resource, item.id, { sortNumber: item.sortNumber })
          }
        } else {
          await this.resourceRepository.createResource(item, manager)
        }
      }
      let messageList = invalidIds.length ? ['有部分资源被删除了，无法批量更新顺序'] : []
      if (insertItems.length && invalidIds.length) {
        messageList.push('数据插入成功，请手动进行排序')
      }
      return {
        info: messageList.length ? messageList.join('，') : null,
      }
    })
  }
  async removeResource(id: number): Promise<null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.batchUpdateSortNumber(resourceEntity, manager)
      await this.resourceRepository.removeResource(resourceEntity, manager)
      return null
    })
  }
  async batchRemoveResource(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const resources = await this.resourceRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (resources.length !== ids.length) {
      missingIds = idList.filter((id) => !resources.some((resource) => resource.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.batchRemoveResource(resources, manager)
      await this.resourceRepository.resetSortNumber(manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }
  async updateResourceStatus(id: number, resourceUpdateDto: UpdateStatusDto): Promise<null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.updateResourceStatus(
        resourceEntity,
        resourceUpdateDto.status,
        manager,
      )
      return null
    })
  }
  async batchUpdateResourceStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const resources = await this.resourceRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (resources.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !resources.some((resource) => resource.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.batchUpdateResourceStatus(
        resources,
        batchUpdateStatusDto.status,
        manager,
      )
      return {
        notFoundIds: missingIds,
      }
    })
  }

  async resetResourceListSort() {
    return await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.resetSortNumber(manager)
      return null
    })
  }

  async downloadTemplate() {
    return null
  }
  async importResource() {
    return null
  }
  async exportResource() {
    return null
  }
}
