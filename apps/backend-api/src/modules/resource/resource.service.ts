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
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'

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
    return await this.dataSource.transaction(async (manager) => {
      const resourceEntity = await this.resourceRepository.createResource(
        resourceCreateDto,
        manager,
      )
      // todo 添加资源角色
      return resourceEntity
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
  async removeResource(id: number): Promise<null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource.transaction(async (manager) => {
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
